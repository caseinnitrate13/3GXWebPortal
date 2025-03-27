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

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


const template = fs.readFileSync(path.join(__dirname, '..', 'public', 'template.html'), 'utf-8');

// route for html pages

// REGISTER

// Multer Storage for Business Permit & Valid ID
const storage = multer.memoryStorage(); // Store files in memory first
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

        const basePath = path.join(__dirname, "uploads", "users", userID);
        fs.mkdirSync(basePath, { recursive: true });

        const businessPermitDir = path.join(basePath, "business_permit");
        const validIdDir = path.join(basePath, "valid_id");
        fs.mkdirSync(businessPermitDir, { recursive: true });
        fs.mkdirSync(validIdDir, { recursive: true });

        const busPermitFilename = `${Date.now()}-${req.files['busPermit'][0].originalname}`;
        const validIdFilename = `${Date.now()}-${req.files['validId'][0].originalname}`;

        const busPermitPath = path.join(businessPermitDir, busPermitFilename);
        const validIdPath = path.join(validIdDir, validIdFilename);

        await fs.promises.writeFile(busPermitPath, req.files['busPermit'][0].buffer);
        await fs.promises.writeFile(validIdPath, req.files['validId'][0].buffer);

        // Store public-accessible paths
        const busPermitPublicPath = `/uploads/users/${userID}/business_permit/${busPermitFilename}`;
        const validIdPublicPath = `/uploads/users/${userID}/valid_id/${validIdFilename}`;

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
            userID, req.body.regUsername, hashedPassword, req.body.regCompanyName,
            req.body.regCompanyAddress, req.body.regCompanyEmail, JSON.stringify(parsedRepNames),
            req.body.regPhoneNum, busPermitPublicPath, validIdPublicPath, "Client", "Pending", accCreated
        ];

        dbService.registerUser(userData, (err, result) => {
            if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({ success: false, message: "Error registering user" });
            }
            res.json({ success: true, message: "Registration successful!", userID });
        });

    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});




app.get('/quotation', (req, res) => {
    const quotationContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'quotations.html'), 'utf-8');
    res.send(template.replace('{{content}}', quotationContent));
});

app.get('/request-for-quotation-form', (req, res) => {
    const requestForm = fs.readFileSync(path.join(__dirname, '..', 'public', 'rfq-form.html'), 'utf-8');
    res.send(template.replace('{{content}}', requestForm));
});

app.get('/account', (req, res) => {
    const accountContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'account.html'), 'utf-8');
    res.send(template.replace('{{content}}', accountContent));
});

// app.get('/view-quotation', (req, res) => {
//     const viewQuotation =fs.readFileSync(path.join(__dirname, '..', 'public', 'view-quotation.html'), 'utf-8');
//     res.send(template.replace('{{content}}', viewQuotation));
// });


app.use((req, res) => {
    res.status(404).send(template.replace('{{content}}', '<h3>404 - Page Not Found</h3>'));
});

app.listen(port, () => {
    console.log(`Server started at http://127.0.0.1:${port}`);
});
