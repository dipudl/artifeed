const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');

// for getting multiple articles of current user
// can also be used for filtering articles
router.get('/my-articles', (req, res) => {
    
});

// for deleting single article
router.delete('/', (req, res) => {
    
});

module.exports = router;