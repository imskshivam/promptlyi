const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace keys
    content = content.replace(/_inr/g, '_usd');
    content = content.replace(/inr/gi, (match) => {
        if (match === "inr") return "usd";
        if (match === "INR") return "USD";
        if (match === "Inr") return "Usd";
        return match;
    });

    // Replace symbols
    content = content.replace(/₹/g, '$');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated:", filePath);
    }
}

function walkSync(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                walkSync(filepath, callback);
            }
        } else if (stats.isFile()) {
            if (filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
                callback(filepath);
            }
        }
    });
}

walkSync('d:/app/promptlyi/frontend/src', processFile);
walkSync('d:/app/promptlyi/backend/src', processFile);
