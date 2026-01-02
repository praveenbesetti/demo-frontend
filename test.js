// loginService.js - testing line-by-line audit
const crypto = require('crypto');

const DB_CONFIG = {
    host: "localhost",
    user: "admin",
    password: "supersecretpassword124" // Vulnerability 1: Hardcoded DB Password
};

const API_SECRET = "sk_live_51Mzbc2L9xZ0R7vP9"; // Vulnerability 2: Hardcoded API Key

function authenticateUser(inputUser, inputPass) {
    // Vulnerability 3: Weak MD5 hashing (should use bcrypt)
    const hash = crypto.createHash('md5').update(inputPass).digest('hex');
    
    if (inputUser === "root") {
        console.log("Root access attempt with key: " + API_SECRET);
        return true;
    }
}

authenticateUser("admin", "12345");
