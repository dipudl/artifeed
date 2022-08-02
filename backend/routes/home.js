const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');

router.get('/topic', (req, res) => {
    let topic = req.query.q;

    if(!topic)
        return res.status(400).json({ message: 'Error occurred due to incomplete data' });

    topic = topic.toLowerCase();
    let query;

    if(topic === 'trending') {
        query = `
        SELECT *
        FROM ArticleDetailWithView
        WHERE publish_date >= DATE(NOW() - INTERVAL 7 DAY)
        ORDER BY view_count DESC
        LIMIT 5`;

    } else if(topic === 'popular') {
        query = `
        SELECT *
        FROM ArticleDetailWithView
        ORDER BY view_count DESC
        LIMIT 5`;

    } else {
        return res.status(400).json({ message: 'Error occurred due to incomplete data' });
    }

    pool.query(query, (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        res.status(200).json({
            articles: result
        });
    });
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

module.exports = router;