const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');

router.get('/', (req, res) => {
    
});

// PUT vs. PATCH
/* 
** PUT -> Used when all fields of a resource are updated (entire update)
** PATCH -> Used when some fields are updated (partial update)
*/

router.patch('/details', (req, res) => {
    
});

router.patch('/image', (req, res) => {
    
});

router.get('/search', (req, res) => {
    
});

module.exports = router;