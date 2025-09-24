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
        try {
            if (typeof user.accountStatus === "string") {
                user.accountStatus = JSON.parse(user.accountStatus);
            }
        } catch (e) {
            console.warn("Failed to parse accountStatus:", user.accountStatus);
            user.accountStatus = { status: user.accountStatus, remarks: "" };
        }

        if (userID) {
            return callback(null, {
                success: true,
                userID: user.userID,
                accountStatus: user.accountStatus
            });
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
    const { userID, username, companyName, companyAddress, email, phoneNumber, profilepic } = data;

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

async function deleteUserProfilePic(userID) {
    const sql = `UPDATE users SET profilepic = NULL WHERE userID = ?`;
    return new Promise((resolve, reject) => {
        connection.query(sql, [userID], (err, result) => {
            if (err) {
                console.error('Error deleting profile pic in DB:', err);
                reject({ success: false, error: err });
            } else {
                resolve({ success: result.affectedRows > 0 });
            }
        });
    });
}

function updateUserPassword(userID, currentPassword, newHashedPassword) {
    return new Promise((resolve, reject) => {

        const sqlGetUser = "SELECT * FROM users WHERE userID = ?";
        connection.query(sqlGetUser, [userID], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) {
                return resolve({ success: false, message: "User not found." });
            }
            const user = results[0];
            bcrypt.compare(currentPassword, user.password, (compareErr, isMatch) => {
                if (compareErr) return reject(compareErr);
                if (!isMatch) {
                    return resolve({ success: false, message: "Current password is incorrect." });
                }
                const sqlUpdate = "UPDATE users SET password = ? WHERE userID = ?";
                connection.query(sqlUpdate, [newHashedPassword, userID], (updateErr, updateResult) => {
                    if (updateErr) return reject(updateErr);
                    resolve({ success: updateResult.affectedRows > 0 });
                });
            });
        });
    });
}


function saveRFQRequest(data) {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO REQUESTS 
        (requestID, userID, RFQNo, requestDate, validity, totalBudget, details, items, requestStatus, attachment, quotationStatus, purchaseOrder)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

        const values = [
            data.requestID,
            data.userID,
            data.RFQNo,
            data.requestDate,
            data.validity,
            data.totalBudget,
            data.details,
            data.items,
            data.requestStatus,
            data.attachment,
            data.quotationStatus,
            data.purchaseOrder

        ];

        connection.query(query, values, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

function getRequestCountsByUser(userID, callback) {
    const sql = `
      SELECT requestStatus AS status, COUNT(*) AS count
      FROM requests
      WHERE userID = ? AND requestStatus IN ('Draft', 'Pending')
      GROUP BY requestStatus
    `;

    connection.query(sql, [userID], (err, results) => {
        if (err) {
            return callback("Database error: " + err, null);
        }
        const counts = {};
        results.forEach(row => {
            counts[row.status] = row.count;
        });

        callback(null, counts);
    });
}

// Client
function getRequestsByStatus(userID, status, callback) {
    const sql = `
      SELECT requestID, RFQNo, totalBudget, requestDate
      FROM requests
      WHERE userID = ? AND requestStatus = ?
    `;
    connection.query(sql, [userID, status], (err, results) => {
        if (err) {
            return callback("Database error: " + err, null);
        }
        callback(null, results);
    });
}

function getRequestByID(requestID) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM requests WHERE requestID = ?";
        connection.query(query, [requestID], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

async function updateRFQRequest(requestID, data) {
    const fields = Object.keys(data).filter(k => k !== 'requestID');
    const values = fields.map(field => data[field]);
    const sql = `UPDATE requests SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE requestID = ?`;

    values.push(requestID);

    try {
        const result = await connection.query(sql, values);
        return result;
    } catch (err) {
        console.error("DB Update Error:", err);
        throw err;
    }
}

function deleteRequest(requestID) {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM requests WHERE requestID = ?";
        connection.query(query, [requestID], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function getRespondedRequests(userID) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                r.*, 
                res.* 
            FROM requests r
            JOIN response res ON r.requestID = res.requestID
            WHERE r.requestStatus = 'Responded' AND r.userID = ?
        `;

        connection.query(query, [userID], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function getRespondedRequestById(requestID) {
    return new Promise((resolve, reject) => {
        const query = `
      SELECT 
        r.*, 
        res.* 
      FROM requests r
      JOIN response res ON r.requestID = res.requestID
      WHERE r.requestID = ?
    `;

        connection.query(query, [requestID], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function updateQuotationRequest(requestID, updateData) {
    return new Promise((resolve, reject) => {
        const { status, poFile, remarks } = updateData;
        const query = `
            UPDATE requests
            SET 
                quotationStatus = JSON_SET(quotationStatus, '$.status', ? , '$.remarks', ?),
                purchaseOrder = JSON_SET(purchaseOrder, '$.client', ?)
            WHERE requestID = ?
        `;

        connection.query(query, [status, remarks || '', poFile || null, requestID], (err, results) => {
            if (err) {
                reject(err);
            } else {
                if (results.affectedRows > 0) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Quotation not found or update failed'));
                }
            }
        });
    });
}

//ADMIN SIDE

function getAllRequestsByStatus(status, callback) {
    const sql = `
        SELECT r.requestID, r.RFQNo, r.totalBudget, r.validity, r.quotationStatus,
               u.companyname, r.requestStatus
        FROM requests r
        JOIN users u ON r.userID = u.userID
        WHERE r.requestStatus = ?
    `;
    connection.query(sql, [status], (err, results) => {
        if (err) {
            return callback("Database error: " + err, null);
        }
        const parsedResults = results.map(row => {
            try {
                row.quotationStatus = row.quotationStatus ? JSON.parse(row.quotationStatus) : null;
            } catch (e) {
                row.quotationStatus = null;
            }
            return row;
        });

        callback(null, parsedResults);
    });
}

function getAllClients(callback) {
    const sql = `
        SELECT userID, username, companyName, companyAddress, businessPermit, validID, accountStatus
        FROM users
        WHERE userRole = 'Client'
    `;
    connection.query(sql, (err, results) => {
        if (err) {
            return callback("Database error: " + err, null);
        }

        const parsedResults = results.map(row => {
            try {
                row.accountStatus = row.accountStatus
                    ? JSON.parse(row.accountStatus)
                    : null;
            } catch (e) {
                row.accountStatus = null;
            }
            return row;
        });

        callback(null, parsedResults);
    });
}

function updateAccountStatus(userID, status, remarks, callback) {
    const accountStatus = JSON.stringify({
        status: status,
        remarks: remarks
    });

    const sql = `
        UPDATE users 
        SET accountStatus = ? 
        WHERE userID = ?
    `;

    connection.query(sql, [accountStatus, userID], (err, result) => {
        if (err) {
            return callback("Database error: " + err, null);
        }
        callback(null, result);
    });
}

function saveResponse(data) {
    return new Promise((resolve, reject) => {
        const query = `
      INSERT INTO RESPONSE
      (responseID, requestID, quotationNo, quotationDate, totalValue, supplierDetails, supattachment)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        const values = [
            data.responseID,
            data.requestID,
            data.quotationNo,
            data.quotationDate,
            data.totalValue,
            data.supplierDetails,
            data.attachment
        ];
        connection.query(query, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

async function updateRequestItems(requestID, itemsJSON) {
    try {
        const sql = `
      UPDATE REQUESTS 
      SET items = ?, requestStatus = ? 
      WHERE requestID = ?
    `;
        const values = [itemsJSON, "Responded", requestID];

        const result = await connection.query(sql, values);
        return result;
    } catch (err) {
        console.error("DB Update Items Error:", err);
        throw err;
    }
}


module.exports = {
    registerUser, checkDuplicateUser, loginUser, getUserDetails, updateRepNames,
    addSubRepresentative, getSubRepresentatives, deleteSubRepresentative, updateUserProfile, deleteUserProfilePic,
    updateUserPassword, saveRFQRequest, getRequestCountsByUser, getRequestsByStatus, getRequestByID, updateRFQRequest, deleteRequest,
    getRespondedRequests, updateQuotationRequest, getRespondedRequestById, getAllRequestsByStatus, getAllClients, updateAccountStatus,
    saveResponse, updateRequestItems
};
