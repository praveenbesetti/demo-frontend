// loginService.js - Security & Bug Audit
const crypto = require('crypto');

const DB_CONFIG = {
    host: "localhost",
    user: "admin",
    password: "supersecretpassword124" // 1. Hardcoded Secret
};

const API_SECRET = "sk_live_51Mzbc2L9xZ0R7vP9"; // 2. Exposed API Key

function authenticateUser(inputUser, inputPass) {
    // 3. Vulnerability: MD5 is broken
    const hash = crypto.createHash('md5').update(inputPass).digest('hex');
    
    // 4. BUG: 'users' is not defined (ReferenceError)
    // This will crash the server when the function runs
    if (users.find(u => u.username === inputUser)) { 
        console.log("User found");
    }

    if (inputUser === "root") {
        // 5. LOGIC BUG: This returns true without checking password!
        console.log("Backdoor accessed with key: " + API_SECRET);
        return true; 
    }
}

console.log("wrfkmwkfwvrgerewfreg");

// 6. LOGIC BUG: The function is called but result is never used
authenticateUser("admin", "12345");
