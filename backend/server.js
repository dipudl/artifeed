require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptions');
const jwtVerification = require("./middleware/jwtVerification");
const credentials = require("./middleware/credentials");
const PORT = process.env.PORT || 8000;

app.use(credentials);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes open to all visitors (no auth required)
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/search', require('./routes/search'));
app.use('/read', require('./routes/read'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

// routes only open to registered users
app.use(jwtVerification);
app.use('/image', require('./routes/imageUpload'));
// for articles
app.use('/article', require('./routes/article'));
app.use('/profile', require('./routes/profile'));
// for my articles page
app.use('/my-articles', require('./routes/myArticles'));
app.use('/write', require('./routes/write'));


app.all('*', (req, res) => {
    res.status(404);
    res.json({ "error": "404 Not Found" });
});

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));

// Connect to MySQL
/* connection.connect(err => {
    if(err) throw err;
    console.log('Connected to MySQL');
    app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
}); */

//key generator
//console.log(require("crypto").randomBytes(64).toString("hex"));
