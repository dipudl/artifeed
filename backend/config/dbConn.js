const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'toorroot',
    database: 'artifeed',
    debug: false
});

module.exports = pool;