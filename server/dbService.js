const mysql = require('mysql');
const bcrypt = require('bcryptjs');
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

// Function to authenticate user login
function loginUser({ username, password, userID }, callback) {
    let query;
    let params;

    if (userID) {

        query = "SELECT userID, accountStatus FROM users WHERE userID = ? LIMIT 1";
        params = [userID];
    } else if (username && password) {

        query = "SELECT userID, username, password, userRole, accountStatus FROM users WHERE username = ? LIMIT 1";
        params = [username];
    } else {
        return callback(null, { success: false, message: "Invalid request" });
    }

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback(null, { success: false, message: "User not found" });
        }

        const user = results[0];

        if (userID) {

            return callback(null, { success: true, userID: user.userID, accountStatus: user.accountStatus });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("bcrypt error:", err);
                return callback(err, null);
            }

            if (!isMatch) {
                return callback(null, { success: false, message: "Invalid username or password" });
            }

            callback(null, {
                success: true,
                userID: user.userID,
                username: user.username,
                userRole: user.userRole,
                accountStatus: user.accountStatus
            });
        });
    });
}

function getUserDetails(userID, callback) {
    const sql = `SELECT username, companyName, companyAddress, companyEmail, repNames, repNum FROM users WHERE userID = ?`;
    connection.query(sql, [userID], (err, result) => {
        if (err) return callback(err, null);
        if (result.length === 0) {
            return callback(null, { success: false, message: "User not found" });
        }
        callback(null, { success: true, user: result[0] });
    });
}

// Function to update the mainrepNames
function updateRepNames(userID, repNames, callback) {
    userID = userID.trim();
    if (userID.startsWith('"') && userID.endsWith('"')) {
        userID = userID.slice(1, -1);
    }

    const repNamesJSON = JSON.stringify(repNames);

    const updateQuery = 'UPDATE users SET repNames = ? WHERE userID = ?';
    console.log("Executing update query:", updateQuery);
    console.log("With values:", [repNamesJSON, userID]);

    connection.query(updateQuery, [repNamesJSON, userID], (err, result) => {
        if (err) {
            console.log("Error updating repNames:", err);
            return callback(err, null);
        }

        console.log("Update result:", result);
        if (result.affectedRows > 0) {
            return callback(null, { success: true });
        } else {
            console.log("No rows affected. UserID may not exist.");
            return callback(null, { success: false, message: "User not found or data unchanged" });
        }
    });
}




module.exports = { registerUser, checkDuplicateUser, loginUser, getUserDetails, updateRepNames };
