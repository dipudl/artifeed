const express = require('express');
const multer = require('multer');
const router = express.Router();
const pool = require('../config/dbConn');
const { PROFILE_PIC_STORAGE_PATH, EMAIL_REGEX, USERNAME_REGEX } = require('../utils/constants');
const { removeFile } = require('../utils/functions');
const { uploadFile, multerUploader } = require('../utils/imageUpload');

router.get('/', (req, res) => {
    const query = 'SELECT first_name, last_name, email, username, description, image_url FROM User WHERE user_id=?';

    pool.query(query, req.user_id, (err, response) => {
        if(err) {
            console.log(err);
            res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
        } else {
            res.status(200).json(response[0]);
        }
    });
});

// PUT vs. PATCH
/* 
** PUT -> Used when all fields of a resource are updated (entire update)
** PATCH -> Used when some fields are updated (partial update)
*/

router.patch('/details', (req, res) => {
    const data = req.body;
    console.log('Data', data);

    if(!data.firstName || data.firstName.trim().length < 2) {
        res.status(400).json({ message: 'First name must contain 2 or more letters' });

    } else if(!data.lastName || data.lastName.trim().length < 2) {
        res.status(400).json({ message: 'Last name must contain 2 or more letters' });

    } else if(!data.email || !data.email.match(EMAIL_REGEX)) {
        res.status(400).json({ message: 'Invalid email' });

    } else if(!data.username || data.username.length < 2 || !data.username.match(USERNAME_REGEX)) {
        res.status(400).json({ message: 'Username can only contain a-z, 0-9 and underscore and must have 3 to 30 characters' });

    } else if(!data.description) {
        res.status(400).json({ message: 'Description must not be empty' });

    } else if(data.description.length > 200) {
        res.status(400).json({ message: 'Description must be limited to 200 characters' });

    } else {
        data.email = data.email.toLowerCase();
        
        const emailCheckQuery = 'SELECT * FROM User WHERE (email=? OR username=?) AND user_id<>?';
        pool.query(emailCheckQuery, [data.email, data.username, req.user_id], (err, response) => {
            if(err) {
                console.log(err);
                return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
            }

            if(response.length > 0) {
                let emailConflict = false, usernameConflict = false;

                response.forEach(element => {
                    if(element.email === data.email) emailConflict = true;
                    if(element.username === data.username) usernameConflict = true;
                });

                if(emailConflict && usernameConflict)
                    return res.status(409).json({ message: 'Both email and username already exist. Please try other values.' });
                else if(emailConflict)
                    return res.status(409).json({ message: 'Email already exists. Please try another email address.' });
                else if(usernameConflict)
                    return res.status(409).json({ message: 'Username already exists. Please try another username.' });
            }

            const updateQuery = 'UPDATE User SET first_name=?, last_name=?, email=?, username=?, description=? WHERE user_id=?';
            pool.query(updateQuery,
                [data.firstName, data.lastName, data.email, data.username, data.description, req.user_id],
                (error, result) => {
                    if(error) {
                        console.log(error);
                        return res.status(500).json({
                            message: 'An unexpected error occurred. Please try again.'
                        });
                    }
                    
                    return res.sendStatus(200);
            });
        });
    }
});


router.patch('/image', (req, res) => {
    const upload = multerUploader.single("uploaded_file");

    upload(req, res, (err) => {
        if(err instanceof multer.MulterError) {
            console.log(err);
            if(err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ message: "File too large. Maximum size limit is 2MB." });
            }
            return res.status(400).json({ message: err.code });
        } else if (err) {
            return res.status(415).json({ message: err.message });
        }

        uploadFile(req.file, PROFILE_PIC_STORAGE_PATH)
            .then(() => {
                const uploaded_image_url = `${process.env.FIREBASE_BASE_PROFILE_PIC_URL}${req.file.filename}?alt=media`;
                const updateQuery = 'UPDATE User SET image_url=? WHERE user_id=?';

                pool.query(updateQuery, [uploaded_image_url, req.user_id], (db_error, response) => {
                    if(db_error) {
                        res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
                    } else {
                        res.status(200).json({'image_url': uploaded_image_url});
                    }
                });
            })
            .catch((error) => {
                console.log("Upload error :::", error);
                res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
            })
            .finally(() => {
                removeFile(req.file.filename);
            });
    })
});

module.exports = router;