const express = require('express');
const { query } = require('../config/dbConn');
const mysql = require('mysql2');
const router = express.Router();
const pool = require('../config/dbConn');

router.get('/', (req, res) => {
    const permalink = req.query.article;
    const userId = req.query['user-id'];
    
    if(!permalink)
        return res.send(404).json({ message: 'Page not found' });

    const articleFetchQuery = `
    SELECT a.article_id, a.author_id, title, content, CONCAT(u.first_name, ' ', u.last_name) as author_name,
    u.description as author_description, u.image_url as author_image_url, COUNT(l.user_id) as like_count
    FROM Article AS a
    INNER JOIN User AS u ON a.author_id = u.user_id
    LEFT JOIN ArticleLike as l ON a.article_id = l.article_id
    WHERE permalink=?`;

    const articleWithLikedFetchQuery = `
    SELECT a.article_id, a.author_id, title, content, CONCAT(u.first_name, ' ', u.last_name) as author_name,
    COUNT(l.user_id) as like_count, u.description as author_description, u.image_url as author_image_url,
    EXISTS(SELECT * from ArticleLike WHERE user_id=? AND article_id IN (
        SELECT article_id FROM Article WHERE permalink=?
    )) as liked
    FROM Article AS a
    INNER JOIN User AS u ON a.author_id = u.user_id
    LEFT JOIN ArticleLike as l ON a.article_id = l.article_id
    WHERE permalink=?`;

    const articleViewUpdateQuery = `
    INSERT INTO ArticleView (article_id, date, view_count)
    VALUES(?, CURRENT_DATE(), 1)
    ON DUPLICATE KEY
    UPDATE view_count = view_count + 1`;

    let articleQuery;

    console.log("View", permalink);

    if(userId) {
        articleQuery = mysql.format(articleWithLikedFetchQuery, [userId, permalink, permalink]);
    } else {
        articleQuery = mysql.format(articleFetchQuery, [permalink]);
    }

    pool.query(articleQuery, (err, response) => {
        if (err) { 
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        if(response.length === 0 || !response[0].article_id)
            return res.status(404).json({ message: 'Page not found' });

        pool.query(articleViewUpdateQuery, response[0].article_id, (error, result) => {
            if (error) { 
                console.log(err);
                return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
            }

            return res.status(200).json(response[0]);
        })
    });
});

router.get('/comment', (req, res) => {
    
});

router.get('/author-articles', (req, res) => {
    const authorId = req.query['author-id'];
    const articleId = req.query['article-id'];
    if(!authorId || !articleId)
        return res.status(400).json({ message: 'Error occurred due to incomplete data' });

    /* const authorArticlesQuery = `
    SELECT a.article_id, title, permalink, featured_image
    FROM Article AS a
    WHERE a.article_id<>? AND author_id=?
    ORDER BY publish_date DESC, a.article_id DESC
    LIMIT 5`; */

    const authorArticlesQuery = `
    SELECT article_id, title, permalink, featured_image
    FROM FullArticleDetail
    WHERE article_id<>? AND author_id=?
    ORDER BY like_count DESC, view_count DESC
    LIMIT 5`;

    pool.query(authorArticlesQuery, [articleId, authorId], (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        res.status(200).json({
            articles: result
        });
    });
});



router.get('/recommended-articles', (req, res) => {
    const articleId = req.query['article-id'];
    const authorId = req.query['author-id'];
    
    if(!articleId || !authorId)
        return res.send(400).json({ message: 'Error occurred due to incomplete data' });

    const recommendedArticlesQuery = `
    SELECT *
    FROM FullArticleDetail
    WHERE author_id<>?
    ORDER BY like_count DESC, view_count DESC
    LIMIT 5`;

    pool.query(recommendedArticlesQuery, authorId, (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        res.status(200).json({
            articles: result
        });
    });    
});

module.exports = router;


/* router.get('/', (req, res) => {
    const permalink = req.query.article;
    const userId = req.query['user-id'];
    
    if(!permalink)
        return res.send(404).json({ message: 'Page not found' });

    const articleFetchQuery = `
    SELECT a.article_id, a.author_id, title, content, CONCAT(u.first_name, ' ', u.last_name) as author_name,
    u.description as author_description, u.image_url as author_image_url, COUNT(l.user_id) as like_count
    FROM Article AS a
    INNER JOIN User AS u ON a.author_id = u.user_id
    LEFT JOIN ArticleLike as l ON a.article_id = l.article_id
    WHERE permalink=?`;

    const likeCheckQuery = `SELECT * FROM ArticleLike WHERE article_id=? AND user_id=?`;

    const articleViewUpdateQuery = `
    INSERT INTO ArticleView (article_id, date, view_count)
    VALUES(?, CURRENT_DATE(), 1)
    ON DUPLICATE KEY
    UPDATE view_count = view_count + 1`;

    pool.query(articleFetchQuery, permalink, (err, response) => {
        if (err) { 
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        if(response.length === 0)
            return res.status(404).json({ message: 'Page not found' });

        if(userId) {
            pool.query(likeCheckQuery, [response[0].article_id, userId], (err, rslt) => {
                if (err) { 
                    console.log(err);
                    return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                }

                pool.query(articleViewUpdateQuery, response[0].article_id, (err, result) => {
                    if (err) { 
                        console.log(err);
                        return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                    }
        
                    return res.status(200).json({
                        ...response[0],
                        liked: rslt.length > 0
                    });
                })
            });
        } else {
            pool.query(articleViewUpdateQuery, response[0].article_id, (err, result) => {
                if (err) { 
                    console.log(err);
                    return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                }
    
                return res.status(200).json(response[0]);
            })
        }
    });
}); */

/* router.get('/', (req, res) => {
    const permalink = req.query.article;
    
    if(!permalink)
        return res.send(404).json({ message: 'Page not found' });

    const articleFetchQuery = `
    SELECT a.article_id, a.author_id, title, content, CONCAT(u.first_name, ' ', u.last_name) as author_name,
    u.description as author_description, u.image_url as author_image_url
    FROM Article AS a
    INNER JOIN User AS u ON a.author_id = u.user_id
    WHERE permalink=?`;

    const articleViewUpdateQuery = `
    INSERT INTO ArticleView (article_id, date, view_count)
    VALUES((SELECT article_id FROM Article WHERE permalink=?), CURRENT_DATE(), 1)
    ON DUPLICATE KEY
    UPDATE view_count = view_count + 1`;

    pool.getConnection(async (err, conn) => {
        if(err)
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });

        conn.query(articleFetchQuery, permalink, (err, response) => {
            if (err) { 
                res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                return conn.rollback(() => {throw err});
            }

            if(response.length === 0) {
                res.status(404).json({ message: 'Page not found' });
                return conn.rollback(() => {throw err});
            }

            conn.query(articleViewUpdateQuery, permalink, (err, result) => {
                if (err) { 
                    res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                    return conn.rollback(() => {throw err});
                }

                conn.commit((err) => {
                    if (err) { 
                        res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                        return conn.rollback(() => {throw err});
                    }

                    res.status(200).json(response[0]);
                });
            })
        })
    });
}); */