const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const pool = require('../config/dbConn');

router.get('/', (req, res) => {
    const query = `
    SELECT * FROM FullArticleDetail
    WHERE author_id=?`;

    pool.query(query, req.user_id, (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        return res.status(200).json({ data: result });
    });
});

router.post('/filter', (req, res) => {
    const data = req.body;
    console.log(data);

    let query = 'SELECT * FROM FullArticleDetail ';
    let valueArray = [];

    if(data.search) {
        query += 'WHERE author_id=? AND (title LIKE "%"?"%" OR article_description LIKE "%"?"%" OR category_name LIKE "%"?"%") ';
        valueArray = valueArray.concat([req.user_id, data.search, data.search, data.search]);
    } else {
        query += 'WHERE author_id=? ';
        valueArray.push(req.user_id);
    }

    if(data.category && !isNaN(data.category) && data.category > 0) {
        query += 'AND category_id=? ';
        valueArray.push(data.category);
    }
    
    if(data.sortByType === 0)
        if(data.orderByType === 0)
            query += 'ORDER BY publish_date ASC, article_id ASC';
        else
            query += 'ORDER BY publish_date DESC, article_id DESC';
    else
        if(data.orderByType === 0)
            query += 'ORDER BY view_count ASC, article_id ASC';
        else
            query += 'ORDER BY view_count DESC, article_id DESC';

    pool.query(query, valueArray, (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        return res.status(200).json({ data: result });
    });
});



router.delete('/:articleId', (req, res) => {
    const articleId = parseInt(req.params.articleId);
    console.log(articleId);
    if(!articleId || isNaN(articleId) || articleId <= 0)
        return res.status(400).json({ message: 'Invalid article information' });

    const query = 'SELECT Fn_DeleteArticle(?, ?)';

    pool.query(query, [req.user_id, articleId], (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        console.log(result);

        if(result.length > 0 && result[0][`Fn_DeleteArticle(${req.user_id}, ${articleId})`] === 'success')
            return res.status(200).json({ article_id: articleId });

        return res.status(400).json({ message: 'Failed to delete article' });
    });
});

module.exports = router;