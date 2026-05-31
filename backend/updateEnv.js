const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Remove Polar
envContent = envContent.replace(/^POLAR_.*(\r?\n|$)/gm, '');
envContent = envContent.replace(/^# Polar product IDs.*(\r?\n|$)/gm, '');

// Add Dodo
const dodoConfig = `
# Dodo Payments Configuration
DODO_API_KEY=
DODO_WEBHOOK_SECRET=
DODO_ENVIRONMENT=test_mode

# Dodo Product IDs
DODO_PROD_SUB_BASIC=
DODO_PROD_SUB_PRO=
DODO_PROD_SUB_ELITE=
DODO_PROD_PACK_STARTER=
DODO_PROD_PACK_PRO=
DODO_PROD_PACK_MAX=
DODO_PROD_PROMPT=
`;

envContent += dodoConfig;

fs.writeFileSync(envPath, envContent, 'utf8');
console.log('Updated .env with Dodo configuration');
