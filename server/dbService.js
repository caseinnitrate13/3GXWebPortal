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
    const sql = `SELECT username, companyName, companyAddress, companyEmail, repNames, repNum, profilepic FROM users WHERE userID = ?`;
    connection.query(sql, [userID], (err, result) => {
        if (err) return callback(err, null);
        if (result.length === 0) {
            return callback(null, { success: false, message: "User not found" });
        }
        callback(null, { success: true, user: result[0] });
    });
}


// Function to update representatives
function updateRepNames(userID, repIndex, repData, callback) {
    userID = userID.trim();
    if (userID.startsWith('"') && userID.endsWith('"')) {
        userID = userID.slice(1, -1);
    }

    const selectQuery = 'SELECT repNames FROM users WHERE userID = ?';
    connection.query(selectQuery, [userID], (selectErr, results) => {
        if (selectErr) {
            console.log("Error fetching repNames:", selectErr);
            return callback(selectErr, null);
        }

        if (results.length === 0) {
            return callback(null, { success: false, message: "User not found" });
        }

        let repNamesArray = [];
        try {
            repNamesArray = JSON.parse(results[0].repNames || '[]');
        } catch (parseErr) {
            console.log("Error parsing repNames:", parseErr);
            return callback(parseErr, null);
        }

        if (repIndex >= 0 && repIndex < repNamesArray.length) {
            repNamesArray[repIndex] = repData;
        } else if (repIndex === repNamesArray.length) {
            repNamesArray.push(repData);
        } else {
            return callback(null, { success: false, message: "Invalid representative index." });
        }

        const repNamesJSON = JSON.stringify(repNamesArray);
        connection.query(
            'UPDATE users SET repNames = ? WHERE userID = ?',
            [repNamesJSON, userID],
            (updateErr, result) => {
                if (updateErr) {
                    console.log("Error updating repNames:", updateErr);
                    return callback(updateErr, null);
                }

                if (result.affectedRows > 0) {
                    return callback(null, { success: true });
                } else {
                    return callback(null, { success: false, message: "No changes made." });
                }
            }
        );
    });
}



function addSubRepresentative(userID, rep, callback) {
    const getQuery = 'SELECT repNames FROM users WHERE userID = ?';
    connection.query(getQuery, [userID], (err, result) => {
        if (err) return callback(err);

        if (result.length === 0) {
            return callback(null, { notFound: true });
        }

        let currentReps = [];
        try {
            currentReps = result[0].repNames ? JSON.parse(result[0].repNames) : [];
        } catch (e) {
            return callback(new Error('Invalid repNames format.'));
        }

        currentReps.push(rep);

        const updateQuery = 'UPDATE users SET repNames = ? WHERE userID = ?';
        connection.query(updateQuery, [JSON.stringify(currentReps), userID], (err, updateResult) => {
            if (err) return callback(err);

            return callback(null, { success: updateResult.affectedRows > 0 });
        });
    });
}

function getSubRepresentatives(userID) {
    return new Promise((resolve, reject) => {
        const getQuery = 'SELECT repNames FROM users WHERE userID = ?';
        connection.query(getQuery, [userID], (err, result) => {
            if (err) {
                return reject("Database error: " + err);
            }

            if (result.length === 0) {
                return reject("User not found");
            }

            let reps = [];
            try {
                reps = result[0].repNames ? JSON.parse(result[0].repNames) : [];
                return resolve(reps);
            } catch (e) {
                return reject("Invalid repNames format");
            }
        });
    });
}

function deleteSubRepresentative(userID, repIndex, callback) {
    const sqlSelect = "SELECT repNames FROM users WHERE userID = ?";

    connection.query(sqlSelect, [userID], (err, results) => {
        if (err || results.length === 0) return callback(err || new Error("User not found"));

        let repList;
        try {
            repList = JSON.parse(results[0].repNames);
        } catch (parseError) {
            return callback(parseError);
        }

        if (!Array.isArray(repList) || repIndex < 1 || repIndex >= repList.length) {
            return callback(new Error("Invalid representative index"));
        }

        repList.splice(repIndex, 1);

        const updatedRepNames = JSON.stringify(repList);
        const sqlUpdate = "UPDATE users SET repNames = ? WHERE userID = ?";

        connection.query(sqlUpdate, [updatedRepNames, userID], callback);
    });
}

function updateUserProfile(data) {
    const {userID, username, companyName, companyAddress, email, phoneNumber, profilepic} = data;

    let sql = `UPDATE users SET username = ?, companyName = ?, companyAddress = ?, companyEmail = ?, repNum = ?`;

    const values = [username, companyName, companyAddress, email, phoneNumber];

    if (profilepic) {
        sql += `, profilepic = ?`;
        values.push(profilepic);
    }

    sql += ` WHERE userID = ?`;
    values.push(userID);

    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Database error during updateUserProfile:', err);
                return reject(err);
            }
            resolve({ success: result.affectedRows > 0 });
        });
    });
}



module.exports = {
    registerUser, checkDuplicateUser, loginUser, getUserDetails, updateRepNames,
    addSubRepresentative, getSubRepresentatives, deleteSubRepresentative, updateUserProfile
};
