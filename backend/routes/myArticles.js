const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');

router.get('/', (req, res) => {
    const query = `
    SELECT article_id, title, featured_image, permalink, publish_date, description, c.name as category_name
    FROM Article AS a
    INNER JOIN Category AS c ON a.category_id=c.category_id
    WHERE author_id=?
    ORDER BY publish_date DESC, article_id DESC`;

    pool.query(query, req.user_id, (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        if(result.length === 0) {
            return res.status(204).json({ data: result });
        } else {
            return res.status(200).json({ data: result });
        }
    });
});

router.get('/search', (req, res) => {
    
});

router.delete('/', (req, res) => {
    
});

module.exports = router;