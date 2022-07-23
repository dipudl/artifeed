const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');

router.get('/', (req, res) => {
    console.log("User id:", req.user_id);

    const query = 'SELECT first_name, last_name, email, username, description, image_url FROM User WHERE user_id=?';

    pool.query(query, req.user_id, (err, response) => {
        if(err) {
            console.log(err);
            res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        } else {
            res.status(200).json(response[0]);
        }
    });
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

module.exports = router;