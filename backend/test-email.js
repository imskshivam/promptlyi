require('dotenv').config();
const { sendWelcomeEmail } = require('./src/services/emailService');

async function run() {
    const email = 'sk9965160@gmail.com';
    // Derive name from email exactly like the auth route does
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    console.log(`Testing email sending to: ${email} (name: ${name})`);
    await sendWelcomeEmail(email, name);
    console.log('Done.');
}

run();
