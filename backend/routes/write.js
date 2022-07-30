const express = require('express');
const router = express.Router();
const pool = require('../config/dbConn');
const { v4: uuidv4 } = require('uuid');
const { PERMALINK_REGEX } = require('../utils/constants');
const { createPermalink } = require('../utils/functions');

router.post('/validate-permalink', (req, res) => {
    const permalink = req.body?.permalink

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
    const data = req.body;

    if(!data.title || !data.title.trim()) return res.status(400).json({ message: "Title must not be empty" });
    if(!data.content) return res.status(400).json({ message: "Article content must not be empty" });
    if(!data.category || data.category <= 0) return res.status(400).json({ message: "Please select a category" });
    if(!data.description) return res.status(400).json({ message: "Description must not be empty" });
    if(data.description.length > 200) return res.status(400).json({ message: "Description can only contain 200 characters at max" });
    if(data.permalinkType === 1 && (!data.permalink || !data.permalink.match(PERMALINK_REGEX)))
        return res.status(400).json({
            message: "Permalink can only contain a-z, A-Z, 0-9, underscore and hyphen and must have 5 to 190 characters"
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

module.exports = router;