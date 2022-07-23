const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../config/dbConn');
const { JWT_EXPIRATION_PERIOD, SALT_ROUND, COOKIE_EXPIRATION_TIME, EMAIL_REGEX } = require('../utils/constants');


router.post('/', async (req, res) => {
    const data = req.body;

    if(!data.firstName || data.firstName.trim().length < 2) {
        res.status(400).json({ message: 'First name must contain 2 or more letters' });

    } else if(!data.lastName || data.lastName.trim().length < 2) {
        res.status(400).json({ message: 'Last name must contain 2 or more letters' });

    } else if(!data.email || !data.email.match(EMAIL_REGEX)) {
        res.status(400).json({ message: 'Invalid email' });

    } else if(!data.password || data.password.length < 6) {
        res.status(400).json({ message: 'Password must contain 6 or more characters' });

    } else {
        data.email = data.email.toLowerCase();

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
                (err, response) => {
                    if(err) {
                        console.log(err);
                        res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                    } else {
                        const call_result = response[0][0];

                        if(call_result.success === 1) {
                            const accessToken = jwt.sign(
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

                            res.status(200).json({
                                success: true,
                                accessToken: accessToken
                            });
                        } else {
                            res.status(409).json({ message: call_result.message });
                        }
                    }
                }
            );

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }
    }
});

module.exports = router;