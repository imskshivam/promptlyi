const fs = require('fs');
const path = require('path');

// 1. Remove from app.js
const appJsPath = path.join(__dirname, 'src', 'app.js');
let appCode = fs.readFileSync(appJsPath, 'utf8');
appCode = appCode.replace(/api\.use\("\/subscriptions", require\("\.\/routes\/subscriptions"\)\.router\);\r?\n/, '');
fs.writeFileSync(appJsPath, appCode, 'utf8');

// 2. Remove from env.js
const envJsPath = path.join(__dirname, 'src', 'config', 'env.js');
let envCode = fs.readFileSync(envJsPath, 'utf8');
envCode = envCode.replace(/\s*DODO_PROD_SUB_BASIC:.*?,/g, '');
envCode = envCode.replace(/\s*DODO_PROD_SUB_PRO:.*?,/g, '');
envCode = envCode.replace(/\s*DODO_PROD_SUB_ELITE:.*?,/g, '');
envCode = envCode.replace(/\s*DODO_PROD_PROMPT:.*?,/g, ''); // not needed either
fs.writeFileSync(envJsPath, envCode, 'utf8');

// 3. Remove from .env
const envPath = path.join(__dirname, '.env');
let dotEnv = fs.readFileSync(envPath, 'utf8');
dotEnv = dotEnv.replace(/^DODO_PROD_SUB_.*(\r?\n|$)/gm, '');
dotEnv = dotEnv.replace(/^DODO_PROD_PROMPT=.*(\r?\n|$)/gm, '');
fs.writeFileSync(envPath, dotEnv, 'utf8');

// 4. Update webhook.js
const webhookJsPath = path.join(__dirname, 'src', 'routes', 'webhook.js');
let webhookCode = fs.readFileSync(webhookJsPath, 'utf8');

webhookCode = webhookCode.replace(/const PLANS = {[\s\S]*?};\n\n/, '');
webhookCode = webhookCode.replace(/\s*if \(productId === DODO_PRODUCTS\.sub_basic\).*?;/g, '');
webhookCode = webhookCode.replace(/\s*if \(productId === DODO_PRODUCTS\.sub_pro\).*?;/g, '');
webhookCode = webhookCode.replace(/\s*if \(productId === DODO_PRODUCTS\.sub_elite\).*?;/g, '');

const subLogic = ` else if \\(productDetails\\.type === "subscription"\\) \\{[\\s\\S]*?console\\.log\\(\`\\[payment\\/dodo\\] subscription active: plan \\\${plan\\.id} → user \\\${user\\.id}\`\\);\n                    \\}`;
webhookCode = webhookCode.replace(new RegExp(subLogic), '');

fs.writeFileSync(webhookJsPath, webhookCode, 'utf8');
console.log('Removed subscriptions successfully');
