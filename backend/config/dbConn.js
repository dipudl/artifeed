const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'artifeed',
    debug: false
});

module.exports = pool;