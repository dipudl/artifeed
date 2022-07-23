const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/dbConn');
const { JWT_EXPIRATION_PERIOD } = require('../utils/constants');

router.get('/', (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // check if refresh token is in db
    const userQuery = 'SELECT * FROM User WHERE refreshToken=?';

    pool.query(userQuery, refreshToken, (err, users) => {
        if(err) {
            console.log(err);
            res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        } else {
            if (users.length !== 1) {
                res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
                return res.sendStatus(204);
            }

            // delete refresh token from db
            const updateQuery = 'UPDATE User SET refreshToken = NULL WHERE user_id = ?';
            pool.query(updateQuery, users[0].user_id, (error, result) => {
                if(error) {
                    console.log(err);
                    res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                } else {
                    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = router;