const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/dbConn');
const { JWT_EXPIRATION_PERIOD } = require('../utils/constants');

router.get('/', (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const userQuery = 'SELECT * FROM User WHERE refreshToken=?';

    pool.query(userQuery, refreshToken, (err, users) => {
        if(err) {
            console.log(err);
            res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        } else {
            if(users.length === 1) {
                // evaluate jwt
                jwt.verify(
                    refreshToken,
                    process.env.JWT_REFRESH_KEY,
                    (err, decoded) => {
                        if (err || users[0].user_id !== decoded.user_id){
                            console.log("refresh expiry");
                            return res.sendStatus(401);
                        }
                        
                        const accessToken = jwt.sign(
                            {
                                user_id: users[0].user_id
                            },
                            process.env.JWT_KEY,
                            { expiresIn: JWT_EXPIRATION_PERIOD }
                        );
                        res.json({ accessToken })
                    }
                );
            } else {
                res.sendStatus(401); // Unauthorized
            }
        }
    });
});

module.exports = router;