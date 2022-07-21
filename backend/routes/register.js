const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const data = req.body;
    console.log(data);
    res.send("Good!");
});

module.exports = router;