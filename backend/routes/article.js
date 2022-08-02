const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');

// for getting multiple articles of current user
// can also be used for filtering articles
router.get('/my-articles', (req, res) => {
    
});

router.post('/like', (req, res) => {
    const like = req.body.like;
    const articleId = req.body.articleId;
    let query;

    if(!articleId || isNaN(articleId) || articleId <= 0)
        return res.status(400).json({ message: 'Process failed due to incomplete information' });

    if(like) {
        query = `
        INSERT INTO ArticleLike(user_id, article_id)
        VALUES(?, ?)`;
    } else {
        query = `
        DELETE FROM ArticleLike
        WHERE user_id=? AND article_id=?`;
    }

    pool.query(query, [req.user_id, articleId], (err, result) => {
        if (err) { 
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        return res.sendStatus(200);
    });
});

router.post('/comment', (req, res) => {
    
});

module.exports = router;