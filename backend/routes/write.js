const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');
const { v4: uuidv4 } = require('uuid');
const { PERMALINK_REGEX } = require('../utils/constants');
const { createPermalink } = require('../utils/functions');

router.get('/', (req, res) => {
    const articleId = parseInt(req.query.article);
    
    const articleQuery = `
    SELECT article_id, title, content, category_id, featured_image, permalink, description
    FROM Article
    WHERE author_id=? AND article_id=?`;

    pool.query(articleQuery, [req.user_id, articleId], (err, response) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        if(response.length === 0)
            return res.status(404).json({ message: 'The requested article does not exist or you are not authorized.' });

        const categoryQuery = 'SELECT * FROM Category';
        pool.query(categoryQuery, (error, result) => {
            if(error) {
                console.log(error);
                return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
            }

            res.status(200).json({
                categories: result,
                ...response[0]
            });
        });
    });
});

router.post('/validate-permalink', (req, res) => {
    const permalink = req.body?.permalink

    if(!permalink || permalink.length < 5) {
        res.status(400).json({ message: 'Permalink must contain 5 or more characters' });

    } else if(permalink.length > 180) {
        res.status(400).json({ message: 'Permalink can only contain 180 characters at max' });

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
    const data = req.body;

    if(!data.title || !data.title.trim()) return res.status(400).json({ message: "Title must not be empty" });
    if(!data.content) return res.status(400).json({ message: "Article content must not be empty" });
    if(!data.category || data.category <= 0) return res.status(400).json({ message: "Please select a category" });
    if(!data.description) return res.status(400).json({ message: "Description must not be empty" });
    if(data.description.length > 200) return res.status(400).json({ message: "Description can only contain 200 characters at max" });
    if(data.permalinkType === 1 && (!data.permalink || !data.permalink.match(PERMALINK_REGEX)))
        return res.status(400).json({
            message: "Permalink can only contain a-z, A-Z, 0-9, underscore and hyphen and must have 5 to 180 characters"
        });

    let permalink = data.permalink;
    if(data.permalinkType == 0) {
        permalink = createPermalink(data.title);
        permalink = permalink.substring(0, 180);
        if(permalink.length < 10)
            permalink += '-' + uuidv4();
    }
    
    const publishQuery = `INSERT INTO Article(author_id, title, category_id, featured_image, content, description, permalink)
                   VALUES (?, ?, ?, ?, ?, ?, ?);`;

    const permalinkValidationQuery = 'SELECT COUNT(*) AS count FROM Article WHERE permalink=?';
    pool.query(permalinkValidationQuery, permalink, (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        }

        if(result[0].count > 0) permalink += '-' + new Date().getTime();

        pool.query(
            publishQuery,
            [req.user_id, data.title, data.category, data.featuredImage, data.content, data.description, permalink],
            (error, response) => {
                if(error) {
                    console.log(err);
                    return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                }

                return res.sendStatus(200);
            }
        )
    });
});

router.post('/edit', (req, res) => {
    const data = req.body;
    const articleId = parseInt(data.articleId);
    let permalink = data.permalink;

    if(!articleId || articleId <= 0) return res.status(400).json({ message: "Article not recognized. Edit is unsuccessful." });
    if(!data.title || !data.title.trim()) return res.status(400).json({ message: "Title must not be empty" });
    if(!data.content) return res.status(400).json({ message: "Article content must not be empty" });
    if(!data.category || data.category <= 0) return res.status(400).json({ message: "Please select a category" });
    if(!data.description) return res.status(400).json({ message: "Description must not be empty" });
    if(data.description.length > 200) return res.status(400).json({ message: "Description can only contain 200 characters at max" });
    if(data.permalinkType === 1 && (!permalink || !permalink.match(PERMALINK_REGEX)))
        return res.status(400).json({
            message: "Permalink can only contain a-z, A-Z, 0-9, underscore and hyphen and must have 5 to 180 characters"
        });
    
    if(data.permalinkType === 1) {
        const updateQuery = `
        UPDATE Article
        SET title=?, content=?, category_id=?, featured_image=?, description=?, permalink=?
        WHERE author_id=? AND article_id=?;`;

        const permalinkValidationQuery = 'SELECT COUNT(*) AS count FROM Article WHERE permalink=?';
        pool.query(permalinkValidationQuery, permalink, (err, result) => {
            if(err) {
                console.log(err);
                return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
            }
    
            if(result[0].count > 0) permalink += '-' + new Date().getTime();
    
            pool.query(
                updateQuery,
                [data.title, data.content, data.category, data.featuredImage, data.description, permalink,
                req.user_id, articleId],
                (error, response) => {
                    if(error) {
                        console.log(err);
                        return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                    }
    
                    return res.sendStatus(200);
                }
            )
        });
    } else {
        const updateQuery = `
        UPDATE Article
        SET title=?, content=?, category_id=?, featured_image=?, description=?
        WHERE author_id=? AND article_id=?;`;

        pool.query(
            updateQuery,
            [data.title, data.content, data.category, data.featuredImage, data.description,
            req.user_id, articleId],
            (error, response) => {
                if(error) {
                    console.log(err);
                    return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                }

                return res.sendStatus(200);
            }
        )
    }
});

module.exports = router;