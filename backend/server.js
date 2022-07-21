require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const PORT = process.env.PORT || 8000;

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));

app.all('*', (req, res) => {
    res.status(404);
    res.json({ "error": "404 Not Found" });
});

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));