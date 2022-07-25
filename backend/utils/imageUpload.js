const multer = require('multer');
const storageAdmin = require('../config/storageConfig');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const maxSize = 2 * 1024 * 1024; // 2MB

const storage = multer.diskStorage({
    inMemory: true,
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads/"));
    },
    filename: (req, file, cb) => {
        const imageName = uuidv4() + "." + file.mimetype.split("/")[1];
        console.log(file.originalname, imageName);
        cb(null, imageName);
    },
});

const fileFilter = (req, file, cb) => {
    console.log("mime", file.mimetype);
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Wrong file type. Only jpeg or png file accepted."), false);
    }
};
  
const multerUploader = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: maxSize }
});

function uploadFile(file, bucketFilePath) {
    const metadata = {
      metadata: {
        // This line is very important. It's to create a download token.
        firebaseStorageDownloadTokens: uuidv4(),
      },
      contentType: file.mimetype,
      cacheControl: "public, max-age=31536000",
    };

    const filepath = `./uploads/${file.filename}`;
    return storageAdmin
        .storage()
        .bucket()
        .upload(filepath, {
            destination: `${bucketFilePath}${file.filename}`,
            // Support for HTTP requests made with `Accept-Encoding: gzip`
            gzip: true,
            metadata: metadata,
        });
}

module.exports = {uploadFile, multerUploader};