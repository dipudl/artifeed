const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');

router.get('/', (req, res) => {
    const query = `
    SELECT a.article_id, title, featured_image, permalink, publish_date, description, c.name as category_name,
    COUNT(l.user_id) as like_count, SUM(v.view_count) as view_count
    FROM Article AS a
    INNER JOIN Category AS c ON a.category_id=c.category_id
    LEFT JOIN ArticleLike AS l ON a.article_id = l.article_id
    LEFT JOIN ArticleView AS v ON a.article_id = v.article_id
    WHERE author_id=?
    GROUP BY a.article_id
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

router.delete('/:articleId', (req, res) => {
    const articleId = parseInt(req.params.articleId);
    console.log(articleId);
    if(!articleId || isNaN(articleId) || articleId <= 0)
        return res.status(400).json({ message: 'Invalid article information' });

    const query = `
    DELETE FROM Article
    WHERE author_id=? AND article_id=?`;

    pool.query(query, [req.user_id, articleId], (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        res.status(200).json({ article_id: articleId });
    });
});

module.exports = router;