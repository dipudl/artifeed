const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../config/dbConn');
const { JWT_EXPIRATION_PERIOD, SALT_ROUND, COOKIE_EXPIRATION_TIME } = require('../utils/constants');


router.post('/', async (req, res) => {
    const data = req.body;

    try {
        // password encryption
        const hash = await bcrypt.hash(data.password, SALT_ROUND);

        const fnCall = 'CALL RegisterUser(?, ?, ?, ?, ?, ?, @success, @user_id, @message);';
        // const insertQuery = 'INSERT INTO User(email, password, first_name, last_name, username, image_url) VALUES (?, ?, ?, ?, ?, ?)';
        // const query = mysql.format(insertQuery, [data.email, data.password, data.firstName, data.lastName, `${data.firstName + data.lastName}`, 'https://example.com']);

        pool.query(
            fnCall,
            [data.email, hash, data.firstName, data.lastName, 'roaring_tiger', 'https://example.com',
            '@success', '@user_id', '@message'],
            (err, response, fields) => {
                if(err) {
                    console.log(err);
                    res.json({ success: false, message: err });
                } else {
                    const call_result = response[0][0];

                    if(call_result.success === 1) {
                        const token = jwt.sign(
                            {
                            user_id: call_result.user_id
                            },
                            process.env.JWT_KEY,
                            {
                            expiresIn: JWT_EXPIRATION_PERIOD
                            }
                        );
        
                        const refreshToken = jwt.sign(
                            {
                                user_id: call_result.user_id
                            },
                            process.env.JWT_REFRESH_KEY
                        );

                        // creating secure cookie with refresh token
                        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: COOKIE_EXPIRATION_TIME });

                        res.json({
                            success: true,
                            data: {
                                token
                            }
                        });
                    } else {
                        res.json({ success: false, message: call_result.message });
                    }
                }
            }
        );

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
    }
});

module.exports = router;