const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');
const { PERMALINK_REGEX } = require('../utils/constants');

router.post('/validate-permalink', (req, res) => {
    permalink = req.body?.permalink

    if(!permalink || permalink.length < 5) {
        res.status(400).json({ message: 'Permalink must contain 5 or more characters' });

    } else if(permalink.length > 190) {
        res.status(400).json({ message: 'Permalink can only contain 190 characters at max' });

    } else if(!permalink.match(PERMALINK_REGEX)) {
        res.status(400).json({ message: 'Permalink can only contain a-z, A-Z, 0-9, underscore and hyphen and must have at least 5 characters' });

    } else {
        const query = 'SELECT COUNT(*) AS count FROM Article WHERE permalink=?';
        pool.query(query, permalink, (err, result) => {
            if(err) {
                console.log(err);
                return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
            }
    
            if(result[0].count > 0) {
                return res.status(409).json({ message: 'Permalink already exists. Please try another.' });
            }

            res.sendStatus(200);
        });
    }
});

router.post('/', (req, res) => {
    data = req.body;
    console.log(data);

    res.sendStatus(200);
});

module.exports = router;