const fs = require('fs');
const path = require('path');

const creditsPath = path.join(__dirname, 'src', 'routes', 'credits.js');
let creditsCode = fs.readFileSync(creditsPath, 'utf8');

creditsCode = creditsCode.replace(/const { createCheckout, POLAR_PRODUCTS } = require\("\.\.\/services\/polarService"\);/, 'const { getDodoClient } = require("../config/dodo");\nconst { DODO_PRODUCTS, FRONTEND_ORIGIN } = require("../config/env");');
creditsCode = creditsCode.replace(/const sess = await createCheckout\({[\s\S]*?}\);/, `const dodo = getDodoClient();
    if (!dodo) throw new HttpError(500, "Payment provider not configured");
    const productId = DODO_PRODUCTS[pack.product_key];
    if (!productId) throw new HttpError(500, "Product ID missing");

    const sess = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email: req.user.email, name: req.user.name },
        return_url: \`\${FRONTEND_ORIGIN}/payments/success\`,
    });`);
fs.writeFileSync(creditsPath, creditsCode, 'utf8');


const subsPath = path.join(__dirname, 'src', 'routes', 'subscriptions.js');
let subsCode = fs.readFileSync(subsPath, 'utf8');

subsCode = subsCode.replace(/const { createCheckout, POLAR_PRODUCTS } = require\("\.\.\/services\/polarService"\);/, 'const { getDodoClient } = require("../config/dodo");\nconst { DODO_PRODUCTS, FRONTEND_ORIGIN } = require("../config/env");');
subsCode = subsCode.replace(/const sess = await createCheckout\({[\s\S]*?}\);/, `const dodo = getDodoClient();
    if (!dodo) throw new HttpError(500, "Payment provider not configured");
    const productId = DODO_PRODUCTS[plan.product_key];
    if (!productId) throw new HttpError(500, "Product ID missing");

    const sess = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email: req.user.email, name: req.user.name },
        return_url: \`\${FRONTEND_ORIGIN}/payments/success\`,
    });`);
fs.writeFileSync(subsPath, subsCode, 'utf8');

// For direct prompt purchase, I need to check `prompts.js` or `payments.js`.
// Wait, is there a direct purchase of a prompt using money via Polar?
// Let's check `payments.js` - there was `kind === "prompt"`. How do they check out a prompt?
console.log('Updated credits and subscriptions');
