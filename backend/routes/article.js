const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');

// for getting multiple articles of current user
// can also be used for filtering articles
router.get('/my-articles', (req, res) => {
    
});

router.get('/categories', (req, res) => {
    const query = 'SELECT * FROM Category';
    pool.query(query, (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        res.status(200).json({
            categories: result
        });
    });
});

// for deleting single article
router.delete('/', (req, res) => {
    
});

module.exports = router;