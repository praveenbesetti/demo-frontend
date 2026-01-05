const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const route = require('./Ai_code_checker.js');
const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('🚀 AI Receiver is up and running!');
});

app.use('/', route);
app.listen(PORT, () => {
    console.log(`✅ AI Receiver is running on http://localhost:${PORT}`);
});