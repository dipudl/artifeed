const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Hello World!");
});

router.get('/trending', (req, res) => {
    
});

router.get('/popular', (req, res) => {
    
});

router.get('/category', (req, res) => {
    
});

module.exports = router;