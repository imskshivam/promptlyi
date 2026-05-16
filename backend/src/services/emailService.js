"use strict";
const { Resend } = require("resend");
const { RESEND_API_KEY } = require("../config/env");

let resendClient = null;

if (RESEND_API_KEY) {
    resendClient = new Resend(RESEND_API_KEY);
} else {
    console.warn("[emailService] RESEND_API_KEY is not set. Emails will not be sent.");
}

/**
 * Sends a welcome onboarding email to a new user.
 * @param {string} toEmail - The email address of the new user.
 * @param {string} name - The name of the new user.
 */
async function sendWelcomeEmail(toEmail, name) {
    if (!resendClient) {
        console.log(`[emailService] Mock sending welcome email to ${toEmail}`);
        return;
    }

    try {
        const data = await resendClient.emails.send({
            from: "Promptlyi <noreply@promptlyi.com>", // Make sure to verify this domain in Resend
            to: toEmail,
            subject: "Welcome to Promptlyi! \uD83C\uDF89",
            html: `
                <div style="font-family: Arial, sans-serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #FF4F00;">Welcome to Promptlyi, ${name}!</h1>
                    <p>We are thrilled to have you join our community of prompt engineers and AI enthusiasts.</p>
                    <p>Promptlyi is the best place to discover, buy, and sell highly optimized AI prompts for ChatGPT, Midjourney, and more.</p>
                    
                    <h3>Getting Started</h3>
                    <ul style="line-height: 1.6;">
                        <li><strong>Browse the Marketplace:</strong> Check out the latest and most popular prompts.</li>
                        <li><strong>Start Earning:</strong> Upgrade to a Creator account to start listing your own prompts and earning money.</li>
                        <li><strong>Get Credits:</strong> Purchase credits to unlock premium prompts instantly.</li>
                    </ul>

                    <p>If you have any questions, feel free to reply to this email or reach out to our support team.</p>

                    <p>Happy Prompting!<br><strong>The Promptlyi Team</strong></p>
                </div>
            `,
        });

        console.log(`[emailService] Welcome email sent to ${toEmail}. ID: ${data.id}`);
        return data;
    } catch (error) {
        console.error(`[emailService] Failed to send welcome email to ${toEmail}:`, error);
    }
}

module.exports = {
    sendWelcomeEmail,
};
