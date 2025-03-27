const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('db is ' + connection.state);
});

// Function to register a user
function registerUser(userData, callback) {
    const sql = `INSERT INTO users (userID, username, password, companyName, companyAddress, companyEmail, repNames, repNum, businessPermit, validID, userRole, accountStatus, accCreated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(sql, userData, (err, result) => {
        if (err) return callback(err, null);
        callback(null, { result, userID: userData[0] });
    });
}

// Function to check for duplicate username or email
function checkDuplicateUser(username, companyEmail, callback) {
    const query = "SELECT * FROM users WHERE username = ? OR companyEmail = ?";
    connection.query(query, [username, companyEmail], (err, result) => {
        if (err) return callback(err, null);
        if (result.length > 0) return callback(null, true);
        return callback(null, false); 
    });
}

module.exports = { registerUser, checkDuplicateUser };


