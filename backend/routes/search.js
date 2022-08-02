const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');

router.post('/', (req, res) => {
    const data = req.body;
    console.log(data);

    let query = 'SELECT * FROM FullArticleDetail ';
    let valueArray = [];

    if(data.search) {
        query += 'WHERE (title LIKE "%"?"%" OR article_description LIKE "%"?"%" OR category_name LIKE "%"?"%") ';
        valueArray = valueArray.concat([data.search, data.search, data.search]);

        if(data.category && !isNaN(data.category) && data.category > 0) {
            query += 'AND category_id=? ';
            valueArray.push(data.category);
        }
    } else if(data.category && !isNaN(data.category) && data.category > 0) {
        query += 'WHERE category_id=? ';
        valueArray.push(data.category);
    }
    
    if(data.sortByType === 0)
        if(data.orderByType === 0)
            query += 'ORDER BY publish_date ASC, article_id ASC ';
        else
            query += 'ORDER BY publish_date DESC, article_id DESC ';
    else
        if(data.orderByType === 0)
            query += 'ORDER BY view_count ASC, article_id ASC ';
        else
            query += 'ORDER BY view_count DESC, article_id DESC ';

    query += 'LIMIT 50';

    pool.query(query, valueArray, (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        return res.status(200).json({ data: result });
    });
});

module.exports = router;