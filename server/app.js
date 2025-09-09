const express = require('express');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
dotenv.config();

const dbService = require('./dbService');

const nanoid = async () => {
    const { customAlphabet } = await import('nanoid');
    return customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 12)();
};


const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/get-request', (req, res) => {
    const requestID = req.query.id;
    console.log("Backend received requestID:", requestID);

    dbService.getRequestByID(requestID)
        .then(data => {
            if (data.length > 0) {
                res.json({ success: true, request: data[0] });
            } else {
                res.status(404).json({ success: false, message: "Request not found" });
            }
        })
        .catch(err => {
            console.error("Database error:", err);
            res.status(500).json({ success: false, message: "Server error" });
        });
});


// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.post('/login', (req, res) => {
    const { username, password, userID } = req.body;

    dbService.loginUser({ username, password, userID }, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        if (!result.success) {
            return res.status(401).json({ success: false, message: result.message });
        }

        let redirectUrl = "/request-quotation";

        if (result.accountStatus === "Pending") {
            redirectUrl = "/initial-registration";
        } else if (result.accountStatus === "Declined") {
            redirectUrl = "/";
        } else if (result.accountStatus === "Approved") {
            if (result.userRole === "Admin") {
                redirectUrl = "/adminquotations";
            } else if (result.userRole === "Client"){
                redirectUrl = "/request-quotation";
            }
        }

        res.status(200).json({
            success: true,
            user: result,
            redirect: redirectUrl
        });
    });
});



const template = fs.readFileSync(path.join(__dirname, '..', 'public', 'template.html'), 'utf-8');
const admintemplate = fs.readFileSync(path.join(__dirname, '..', 'public', 'admintemplate.html'), 'utf-8');

// route for html pages

// REGISTER

// Multer Storage for uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

app.post('/register', async (req, res, next) => {
    try {
        res.locals.userID = await nanoid();
        next();
    } catch (error) {
        console.error("Error generating userID:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}, upload.fields([
    { name: 'busPermit', maxCount: 1 },
    { name: 'validId', maxCount: 1 }
]), async (req, res) => {
    try {
        const userID = res.locals.userID;
        if (!userID || typeof userID !== "string") {
            return res.status(500).json({ success: false, message: "Invalid userID" });
        }

        if (!req.files || !req.files['busPermit'] || !req.files['validId']) {
            console.error("File upload failed, req.files:", req.files);
            return res.status(400).json({ success: false, message: "Missing required files" });
        }

        const { regUsername, regCompanyEmail } = req.body;

        dbService.checkDuplicateUser(regUsername, regCompanyEmail, async (err, existingUser) => {
            if (err) {
                console.error("Error checking duplicate user:", err);
                return res.status(500).json({ success: false, message: "Server error" });
            }

            if (existingUser) {
                return res.status(400).json({ success: false, message: "Username or company email already exists" });
            }

            const basePath = path.join(__dirname, "uploads", "users", userID);
            fs.mkdirSync(basePath, { recursive: true });

            const businessPermitDir = path.join(basePath, "business_permit");
            const validIdDir = path.join(basePath, "valid_id");
            fs.mkdirSync(businessPermitDir, { recursive: true });
            fs.mkdirSync(validIdDir, { recursive: true });

            const busPermitFilename = `${Date.now()}-${req.files['busPermit'][0].originalname}`;
            const validIdFilename = `${Date.now()}-${req.files['validId'][0].originalname}`;

            const busPermitPath = `uploads/users/${userID}/business_permit/${busPermitFilename}`;
            const validIdPath = `uploads/users/${userID}/valid_id/${validIdFilename}`;

            await fs.promises.writeFile(path.join(__dirname, busPermitPath), req.files['busPermit'][0].buffer);
            await fs.promises.writeFile(path.join(__dirname, validIdPath), req.files['validId'][0].buffer);

            let hashedPassword;
            try {
                hashedPassword = await bcrypt.hash(req.body.regPassword, 10);
            } catch (error) {
                console.error("Error hashing password:", error);
                return res.status(500).json({ success: false, message: "Error processing password" });
            }

            let parsedRepNames = [];
            if (req.body.repNames) {
                try {
                    parsedRepNames = JSON.parse(req.body.repNames);
                } catch (error) {
                    console.error("Invalid JSON for repNames:", req.body.repNames);
                    return res.status(400).json({ success: false, message: "Invalid representative data format" });
                }
            }

            const accCreated = new Date().toLocaleString('en-CA', { hour12: false }).replace(",", "");

            const userData = [
                userID, regUsername, hashedPassword, req.body.regCompanyName,
                req.body.regCompanyAddress, regCompanyEmail, JSON.stringify(parsedRepNames),
                req.body.regPhoneNum, busPermitPath, validIdPath, "Client", "Pending", accCreated
            ];

            dbService.registerUser(userData, (err, result) => {
                if (err) {
                    console.error("Error inserting user:", err);
                    return res.status(500).json({ success: false, message: "Error registering user" });
                }
                const accountStatus = "Pending";

                if (accountStatus === "Pending") {
                    return res.json({ success: true, message: "Registration successful! Your account is pending approval.", redirect: "/initial-registration", userID });
                }

                res.json({ success: true, message: "Registration successful!", userID });
            });
        });

    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


app.get('/request-quotation', (req, res) => {
    const requestQuotation = fs.readFileSync(path.join(__dirname, '..', 'public', 'request-quotation.html'), 'utf-8');
    res.send(template.replace('{{content}}', requestQuotation));
});

app.get('/quotations', (req, res) => {
    const quotaion = fs.readFileSync(path.join(__dirname, '..', 'public', 'quotations.html'), 'utf-8');
    res.send(template.replace('{{content}}', quotaion));
});

app.get('/responded-requests', async (req, res) => {
    const userID = req.query.userID;
    if (!userID) {
        return res.status(400).json({ success: false, message: 'Missing userID' });
    }

    try {
        const requests = await dbService.getRespondedRequests(userID);
        res.json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching responded requests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/quotation-action', upload.single('poFile'), async (req, res) => {
    const { userID, requestID, action, remarks } = req.body;

    if (!userID || !requestID || !action) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const basePath = path.join(__dirname, 'uploads', 'requests', userID, requestID);

    fs.mkdirSync(basePath, { recursive: true });

    let poFilePath = null;
    let remarksText = remarks || '';

    try {
        if (action === 'Approved' && req.file) {
            const poFile = req.file;
            const filename = `${Date.now()}-${poFile.originalname}`;
            poFilePath = path.join(basePath, filename);

            await fs.promises.writeFile(poFilePath, poFile.buffer);
            poFilePath = `uploads/requests/${userID}/${requestID}/${filename}`;
            console.log('PO file saved:', poFilePath);
        }

        let updateData = { status: action };
        if (action === 'Approved' && poFilePath) {
            updateData.poFile = poFilePath;
        }

        if (action === 'Declined' && remarksText) {
            updateData.remarks = remarksText;
        }

        const result = await dbService.updateQuotationRequest(requestID, updateData);

        if (result.success) {
            res.json({ success: true, message: `Quotation ${action}d successfully!` });
        } else {
            res.status(400).json({ success: false, message: 'Failed to update quotation status in the database.' });
        }
    } catch (error) {
        console.error("[Quotation Action Error]:", error);
        res.status(500).json({ success: false, message: "Error processing quotation action", error: error.message });
    }
});

app.get('/responded-request', async (req, res) => {
    const { requestID } = req.query;
    if (!requestID) return res.json({ success: false, message: "Missing requestID" });

    try {
        const result = await dbService.getRespondedRequestById(requestID);
        res.json({ success: true, request: result[0] });
    } catch (error) {
        console.error("Error fetching single responded request:", error);
        res.json({ success: false, message: "Server error" });
    }
});




app.get('/request-for-quotation-form', (req, res) => {
    const requestForm = fs.readFileSync(path.join(__dirname, '..', 'public', 'rfq-form.html'), 'utf-8');
    res.send(template.replace('{{content}}', requestForm));
});

app.post('/save-rfq', async (req, res, next) => {
    try {
        res.locals.requestID = await nanoid();
        next();
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
}, upload.fields([
    { name: 'attachment', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]), async (req, res) => {
    const isUpdate = !!req.body.requestID;
    const requestID = isUpdate ? req.body.requestID : await nanoid();
    const userID = req.body.userID;
    const basePath = path.join(__dirname, "uploads", "requests", userID, requestID);
    fs.mkdirSync(basePath, { recursive: true });

    let attachmentPath = null;
    let signaturePath = null;

    try {
        // File attachment
        if (req.files?.attachment?.[0]) {
            const file = req.files.attachment[0];
            const filename = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(basePath, filename);
            await fs.promises.writeFile(filePath, file.buffer);
            attachmentPath = `uploads/requests/${userID}/${requestID}/${filename}`;
        } else if (req.body.existingAttachment) {
            attachmentPath = req.body.existingAttachment;
        } else {
            console.log("No attachment uploaded.");
        }

        // Signature
        if (req.body.currentsignPath && req.body.currentsignPath !== "null" && req.body.currentsignPath !== "") {
            signaturePath = req.body.currentsignPath;
            console.log("Using currentsignPath:", signaturePath);
        } else if (req.files?.signature?.[0]) {
            const sig = req.files.signature[0];
            const sigFilename = `clientsignature_${Date.now()}.png`;
            const sigPath = path.join(basePath, sigFilename);
            await fs.promises.writeFile(sigPath, sig.buffer);
            signaturePath = `uploads/requests/${userID}/${requestID}/${sigFilename}`;
        } else {
            console.log("No signature uploaded or provided.");
        }


        const rfqData = {
            requestID,
            userID,
            RFQNo: req.body.RFQNo,
            requestDate: req.body.requestDate,
            validity: req.body.validity,
            totalBudget: req.body.totalBudget,
            details: JSON.stringify({
                ...JSON.parse(req.body.details),
                signaturePath: signaturePath || JSON.parse(req.body.details)?.signaturePath || ""
            }),
            items: JSON.stringify(JSON.parse(req.body.items)),
            requestStatus: req.body.requestStatus,
            attachment: attachmentPath,
            quotationStatus: JSON.stringify(JSON.parse(req.body.quotationStatus)),
            purchaseOrder: JSON.stringify(JSON.parse(req.body.purchaseOrder))
        };

        console.log(isUpdate ? "[Updating RFQ]:" : "[Creating new RFQ]:", rfqData);

        if (isUpdate) {
            await dbService.updateRFQRequest(requestID, rfqData);
            res.json({ success: true, message: "Request updated successfully!" });
        } else {
            await dbService.saveRFQRequest(rfqData);
            res.json({ success: true, message: "Request saved successfully!" });
        }
    } catch (error) {
        console.error("[RFQ Save error]:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

app.get('/request-counts', (req, res) => {
    const { userID } = req.query;
    if (!userID) {
        console.log("Missing userID in request");
        return res.status(400).json({ success: false, message: "Missing user ID" });
    }

    dbService.getRequestCountsByUser(userID, (err, counts) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: err });
        }
        res.json({ success: true, counts });
    });
});

app.get('/requests-by-status', (req, res) => {
    const { userID, status } = req.query;

    if (!userID || !status) {
        return res.status(400).json({ success: false, message: "Missing user ID or status" });
    }

    dbService.getRequestsByStatus(userID, status, (err, requests) => {
        if (err) {
            return res.status(500).json({ success: false, message: err });
        }

        res.json({ success: true, requests });
    });
});

app.post("/delete-request", async (req, res) => {
    const { requestID } = req.body;
    if (!requestID) return res.json({ success: false, message: "Missing request ID." });

    try {
        const requestDataArray = await dbService.getRequestByID(requestID);
        const requestData = requestDataArray[0];

        if (!requestData || !requestData.userID) {
            return res.json({ success: false, message: "Request not found or missing user ID." });
        }

        const userID = requestData.userID;

        const result = await dbService.deleteRequest(requestID);
        if (result.affectedRows > 0) {
            const folderPath = path.join(__dirname, "uploads", "requests", userID, requestID);
            try {
                await fs.promises.rm(folderPath, { recursive: true, force: true });
            } catch (fsErr) {
                console.error("Failed to delete folder:", fsErr.message);
            }

            res.json({ success: true });
        } else {
            res.json({ success: false, message: "No matching request found." });
        }
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Error deleting request." });
    }
});



//ACCOUNT

app.get('/account', (req, res) => {
    const accountContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'account.html'), 'utf-8');
    res.send(template.replace('{{content}}', accountContent));
});

//USER DETAILS (PROFILE OVERVIEW, REPRESENTATIVES, ETC.)
app.get('/user-details', (req, res) => {
    const { userID } = req.query;

    if (!userID) {
        return res.status(400).json({ success: false, message: "Missing user ID" });
    }

    dbService.getUserDetails(userID, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
        if (!result.success) {
            return res.status(404).json({ success: false, message: result.message });
        }
        res.json(result);
    });
});

app.post('/update-representative', (req, res) => {
    const { userID, repIndex, repData } = req.body;

    if (!userID || repIndex === undefined || !repData || !repData.name) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    if (repIndex > 0 && !repData.department) {
        return res.status(400).json({ success: false, message: "Department is required for sub-representative." });
    }

    if (repIndex === 0) {

        if (!repData.position) {
            return res.status(400).json({ success: false, message: "Position is required for main representative." });
        }
    }
    dbService.updateRepNames(userID, repIndex, repData, (err, result) => {
        if (err) {
            console.error("Error updating representative:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }

        if (result.success) {
            return res.status(200).json({ success: true, message: "Representative updated successfully." });
        } else {
            return res.status(400).json({ success: false, message: result.message || "Update failed." });
        }
    });
});


app.post('/add-sub-rep', (req, res) => {
    const { userID, rep } = req.body;

    if (!userID || !rep || !rep.name || !rep.position) {
        return res.status(400).json({ success: false, message: "Invalid data." });
    }

    dbService.addSubRepresentative(userID, rep, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }

        if (result.notFound) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (result.success) {
            return res.json({ success: true });
        } else {
            return res.status(500).json({ success: false, message: "Failed to update representative." });
        }
    });
});

app.get('/get-sub-reps', async (req, res) => {
    const userID = req.query.userID;

    if (!userID) {
        return res.status(400).json({ success: false, message: "Missing userID" });
    }

    try {
        const reps = await dbService.getSubRepresentatives(userID);
        return res.json({ success: true, reps });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.toString() });
    }
});

app.post("/delete-sub-rep", (req, res) => {
    const { userID, repIndex } = req.body;

    if (!userID || repIndex === undefined) {
        return res.status(400).json({ success: false, message: "Missing userID or repIndex." });
    }

    dbService.deleteSubRepresentative(userID, repIndex, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to delete representative." });
        }
        return res.status(200).json({ success: true, message: "Representative deleted successfully." });
    });
});

app.post('/update-profile', upload.fields([
    { name: 'profilePic', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            userID, username, companyName, companyAddress, email, phoneNumber
        } = req.body;

        if (!userID) {
            return res.status(400).json({ success: false, message: "Missing userID" });
        }

        let profilePicPath = null;

        if (req.files && req.files['profilePic'] && req.files['profilePic'][0]) {
            const profilePicFile = req.files['profilePic'][0];
            const ext = path.extname(profilePicFile.originalname);
            const profilePicFilename = `profile${ext}`;

            const basePath = path.join(__dirname, 'uploads', 'users', userID);
            const profilePicDir = path.join(basePath, 'profile_pic');
            const profileFullPath = path.join(profilePicDir, profilePicFilename);


            fs.mkdirSync(profilePicDir, { recursive: true });

            await fs.promises.writeFile(profileFullPath, profilePicFile.buffer);

            profilePicPath = `uploads/users/${userID}/profile_pic/${profilePicFilename}`;
        }

        const result = await dbService.updateUserProfile({
            userID,
            username,
            companyName,
            companyAddress,
            email,
            phoneNumber,
            profilepic: profilePicPath
        });

        if (result.success) {
            res.json({ success: true, message: "Profile updated", profilepicPath: profilePicPath });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update user profile' });
        }

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


app.post('/delete-profile-pic', async (req, res) => {
    const { userID } = req.body;

    if (!userID) {
        return res.status(400).json({ success: false, message: 'Missing userID' });
    }

    try {
        const profilePicPath = path.join(__dirname, 'uploads', 'users', userID, 'profile_pic', 'profile.jpg');

        if (fs.existsSync(profilePicPath)) {
            fs.unlinkSync(profilePicPath);
        }

        const result = await dbService.deleteUserProfilePic(userID);

        res.json({ success: result.success, message: 'Profile picture deleted' });
    } catch (error) {
        console.error('Delete profile pic error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting profile picture' });
    }
});

app.post("/change-password", async (req, res) => {
    const { userID, currentPassword, newPassword } = req.body;

    if (!userID || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Missing fields." });
    }

    try {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const result = await dbService.updateUserPassword(userID, currentPassword, hashedNewPassword);

        if (result.success) {
            return res.json({ success: true, message: "Password updated successfully." });
        } else {
            return res.status(400).json({ success: false, message: result.message });
        }

    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
});


app.get('/view-quotation', (req, res) => {
    const viewQuotation = fs.readFileSync(path.join(__dirname, '..', 'public', 'view-quotation.html'), 'utf-8');
    res.send(template.replace('{{content}}', viewQuotation));
});

app.get('/initial-registration', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'initial-registration.html'));
});


//ADMIN SIDE

app.get('/adminquotations', (req, res) => {
    const adminquotation = fs.readFileSync(path.join(__dirname, '..', 'public', 'adminquotations.html'), 'utf-8');
    res.send(admintemplate.replace('{{content}}', adminquotation));
});

// Admin - get all requests by status (with company name from users table)
app.get('/admin/requests-by-status', (req, res) => {
    const { status } = req.query;

    if (!status) {
        return res.status(400).json({ success: false, message: "Missing request status" });
    }

    dbService.getAllRequestsByStatus(status, (err, requests) => {
        if (err) {
            return res.status(500).json({ success: false, message: err });
        }

        res.json({ success: true, requests });
    });
});


app.get('/purchaseorder', (req, res) => {
    const purchaseorder = fs.readFileSync(path.join(__dirname, '..', 'public', 'purchaseorder.html'), 'utf-8');
    res.send(admintemplate.replace('{{content}}', purchaseorder));
});

app.get('/registeredaccounts', (req, res) => {
    const registeredaccounts = fs.readFileSync(path.join(__dirname, '..', 'public', 'registeredaccounts.html'), 'utf-8');
    res.send(admintemplate.replace('{{content}}', registeredaccounts));
});

app.get("/admin/clients", (req, res) => {
  dbService.getAllClients((err, clients) => {
    if (err) {
      return res.status(500).json({ success: false, message: err });
    }
    res.json({ success: true, clients });
  });
});

app.get('/adminaccount', (req, res) => {
    const adminaccount = fs.readFileSync(path.join(__dirname, '..', 'public', 'adminaccount.html'), 'utf-8');
    res.send(admintemplate.replace('{{content}}', adminaccount));
});


app.use((req, res) => {
    res.status(404).send(template.replace('{{content}}', '<h3>404 - Page Not Found</h3>'));
});

app.listen(port, () => {
    console.log(`Server started at http://127.0.0.1:${port}`);
});
