const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;

// Serve static files from the "public" folder
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const template = fs.readFileSync(path.join(__dirname, 'public', 'template.html'), 'utf-8');

// route for html pages
app.get('/register', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/quotation', (req, res) => {
    const quotationContent = fs.readFileSync(path.join(__dirname, 'public', 'quotations.html'), 'utf-8');
    res.send(template.replace('{{content}}', quotationContent));
});

app.get('/request-for-quotation-form', (req, res) => {
    const requestForm = fs.readFileSync(path.join(__dirname, 'public', 'rfq-form.html'), 'utf-8');
    res.send(template.replace('{{content}}', requestForm));
});

app.get('/account', (req, res) => {
    const accountContent = fs.readFileSync(path.join(__dirname, 'public', 'account.html'), 'utf-8');
    res.send(template.replace('{{content}}', accountContent));
});

app.get('/view-quotation', (req, res) => {
    const viewQuotation =fs.readFileSync(path.join(__dirname, 'public', 'view-quotation.html'), 'utf-8');
    res.send(template.replace('{{content}}', viewQuotation));
});


app.use((req, res) => {
    res.status(404).send(template.replace('{{content}}', '<h3>404 - Page Not Found</h3>'));
});

app.listen(port, () => {
    console.log(`Server started at http://127.0.0.1:${port}`);
});
