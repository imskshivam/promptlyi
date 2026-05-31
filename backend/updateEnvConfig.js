const fs = require('fs');
const path = require('path');

const envJsPath = path.join(__dirname, 'src', 'config', 'env.js');
let content = fs.readFileSync(envJsPath, 'utf8');

// Replace POLAR_* exports with DODO_*
content = content.replace(
    /POLAR_ACCESS_TOKEN: \(process\.env\.POLAR_ACCESS_TOKEN \|\| ""\)\.trim\(\),/g,
    'DODO_API_KEY: (process.env.DODO_API_KEY || "").trim(),'
);
content = content.replace(
    /POLAR_ENVIRONMENT: \(process\.env\.POLAR_ENVIRONMENT \|\| "sandbox"\)\.trim\(\),/g,
    'DODO_ENVIRONMENT: (process.env.DODO_ENVIRONMENT || "test_mode").trim(),'
);
content = content.replace(
    /POLAR_WEBHOOK_SECRET: \(process\.env\.POLAR_WEBHOOK_SECRET \|\| ""\)\.trim\(\),/g,
    'DODO_WEBHOOK_SECRET: (process.env.DODO_WEBHOOK_SECRET || "").trim(),'
);

content = content.replace(/POLAR_PRODUCTS/g, 'DODO_PRODUCTS');
content = content.replace(/POLAR_PROD_SUB_BASIC/g, 'DODO_PROD_SUB_BASIC');
content = content.replace(/POLAR_PROD_SUB_PRO/g, 'DODO_PROD_SUB_PRO');
content = content.replace(/POLAR_PROD_SUB_ELITE/g, 'DODO_PROD_SUB_ELITE');
content = content.replace(/POLAR_PROD_PACK_STARTER/g, 'DODO_PROD_PACK_STARTER');
content = content.replace(/POLAR_PROD_PACK_PRO/g, 'DODO_PROD_PACK_PRO');
content = content.replace(/POLAR_PROD_PACK_MAX/g, 'DODO_PROD_PACK_MAX');
content = content.replace(/POLAR_PROD_PROMPT/g, 'DODO_PROD_PROMPT');

fs.writeFileSync(envJsPath, content, 'utf8');
console.log('Updated env.js');
