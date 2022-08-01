const express = require('express');
const multer = require('multer');
const router = express.Router();
const pool = require('../config/dbConn');
const { IMAGE_STORAGE_PATH } = require('../utils/constants');
const { uploadFile, multerUploader } = require('../utils/imageUpload');


router.post('/upload', (req, res) => {
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

        uploadFile(req.file, IMAGE_STORAGE_PATH)
            .then(() => {
                const uploaded_image_url = `${process.env.FIREBASE_BASE_IMAGE_URL}${req.file.filename}?alt=media`;
                res.status(200).json({'image_url': uploaded_image_url});
            })
            .catch((error) => {
                console.log("Upload error :::", error);
                res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
            });
    })
});

module.exports = router;