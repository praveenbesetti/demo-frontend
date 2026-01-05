// test.js - Initial Safe Version
const express = require('express');
const app = express();

app.get('/status', (req, res) => {
    // Standard status check

    console.log(req);
    res.status(200).json({ status: "online", timestamp: new Date() });
});


console.log("Server logic initialized safely.");

