const jwt = require('jsonwebtoken');

const jwtVerification = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    console.log(token);
    jwt.verify(
        token,
        process.env.JWT_KEY,
        (err, data) => {
            if (err) return res.sendStatus(403); //invalid token
            req.user_id = data.user_id;
            next();
        }
    );
}

module.exports = jwtVerification;