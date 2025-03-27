const express = require('express');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
dotenv.config();

const dbService = require('./dbService');

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, '..', 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


const template = fs.readFileSync(path.join(__dirname, '..', 'public', 'template.html'), 'utf-8');

// route for html pages

// REGISTER

// Multer Storage for Business Permit & Valid ID
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Registration API

app.get('/register', (req,res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

app.post('/register', upload.fields([
    { name: 'busPermit', maxCount: 1 },
    { name: 'validId', maxCount: 1 }
]), (req, res) => {
    const { regUsername, regPassword, regCompanyName, regCompanyAddress, regCompanyEmail, regPhoneNum, repNames } = req.body;

    const busPermitPath = req.files['busPermit'] ? req.files['busPermit'][0].filename : null;
    const validIdPath = req.files['validId'] ? req.files['validId'][0].filename : null;

    // console.log("Bus Permit Path:", busPermitPath);
    // console.log("Valid ID Path:", validIdPath);

    const accCreated = new Date().toLocaleString('en-CA', { hour12: false }).replace(",", "");

    let parsedRepNames;
    try {
        parsedRepNames = JSON.parse(repNames);
    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid representative data" });
    }

    const userData = [
        regUsername,
        regPassword,
        regCompanyName,
        regCompanyAddress,
        regCompanyEmail,
        JSON.stringify(parsedRepNames),
        regPhoneNum,
        busPermitPath,
        validIdPath,
        "Client",
        "Pending",
        accCreated
    ];

    dbService.registerUser(userData, (err, result) => {
        if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ success: false, message: "Error registering user" });
        }
        res.json({ success: true, message: "Registration successful!" });
    });
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
