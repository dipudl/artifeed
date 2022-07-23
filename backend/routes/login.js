const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/dbConn');
const { EMAIL_REGEX, COOKIE_EXPIRATION_TIME, JWT_EXPIRATION_PERIOD, JWT_REFRESH_EXPIRATION_PERIOD } = require('../utils/constants');

router.post('/', async (req, res) => {
    const data = req.body;

    if(!data.email || !data.email.match(EMAIL_REGEX) || !data.password || data.password.length < 6) {
        res.status(401).json({ message: 'Invalid email or password' });

    } else {
        data.email = data.email.toLowerCase();

        try {
            const loginQuery = 'SELECT * FROM User WHERE email=?';

            pool.query(loginQuery, [data.email, data.password], (err, users) => {
                if(err) {
                    console.log(err);
                    res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                } else {
                    if(users.length === 0) {
                        res.status(401).json({ message: 'Invalid email or password' });

                    } else {
                        bcrypt.compare(data.password, users[0].password, (err, result) => {
                            if (err || !result) {
                              return res.status(401).json({ message: 'Invalid email or password' });
                            }

                            const accessToken = jwt.sign(
                                {
                                user_id: users[0].user_id
                                },
                                process.env.JWT_KEY,
                                {
                                expiresIn: JWT_EXPIRATION_PERIOD
                                }
                            );
            
                            const refreshToken = jwt.sign(
                                {
                                    user_id: users[0].user_id
                                },
                                process.env.JWT_REFRESH_KEY,
                                {
                                    expiresIn: JWT_REFRESH_EXPIRATION_PERIOD
                                }
                            );

                            const updateRefreshTokenQuery = 'UPDATE User SET refreshToken=? WHERE user_id=?';

                            pool.query(updateRefreshTokenQuery, [refreshToken, users[0].user_id], (error, result) => {
                                if(error) {
                                    res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                                } else {
                                    // creating secure cookie with refresh token
                                    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: COOKIE_EXPIRATION_TIME });

                                    res.status(200).json({
                                        success: true,
                                        accessToken: accessToken
                                    });
                                }
                            });
                        });
                    }
                }
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }
    }
});

module.exports = router;