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
        const result = await resendClient.emails.send({
            from: "Promtlyi <noreply@promtlyi.com>", // Make sure to verify this domain in Resend
            to: toEmail,
            subject: "Welcome to Promptlyi — The AI Prompt Marketplace",
            html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to Promptlyi</title></head>
<body style="margin:0;padding:0;background:#F7F5F0;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F0;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header / Logo bar -->
        <tr>
          <td style="background:#1A1A1A;padding:24px 32px;border:2px solid #1A1A1A;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:22px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">PROMPTLY<span style="color:#FF4F00;">I</span></span>
                </td>
                <td align="right">
                  <span style="font-size:12px;color:#888;font-weight:500;letter-spacing:1px;text-transform:uppercase;">AI Prompt Marketplace</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="background:#FF4F00;padding:48px 32px 40px;border:2px solid #1A1A1A;border-top:0;position:relative;">
            <!-- Grid overlay: simulated with thin lines -->
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Welcome aboard</p>
            <h1 style="margin:0 0 16px;font-size:40px;font-weight:900;color:#FFFFFF;line-height:1.1;letter-spacing:-1px;">Hey ${name}, <br>you're in. 🎉</h1>
            <p style="margin:0;font-size:17px;color:rgba(255,255,255,0.9);line-height:1.6;font-weight:400;">Your account is ready. You've just joined the marketplace where AI prompts are bought, sold, and monetised — at scale.</p>
          </td>
        </tr>

        <!-- What is Promptlyi -->
        <tr>
          <td style="background:#FFFFFF;padding:36px 32px;border:2px solid #1A1A1A;border-top:0;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#FF4F00;letter-spacing:2px;text-transform:uppercase;">What is Promptlyi?</p>
            <h2 style="margin:0 0 16px;font-size:24px;font-weight:900;color:#1A1A1A;letter-spacing:-0.5px;">The marketplace for AI prompts.</h2>
            <p style="margin:0;font-size:15px;color:#444;line-height:1.7;">
              Promptlyi is the <strong>dedicated marketplace</strong> for high-quality AI prompts. Whether you're a designer, developer, writer, or business — you can discover prompts that actually work for tools like <strong>ChatGPT, Midjourney, Claude, Gemini</strong>, and more.<br><br>
              No fluff. No generic outputs. Every prompt on Promptlyi is crafted for real results.
            </p>
          </td>
        </tr>

        <!-- Divider stripe -->
        <tr><td style="background:#0047FF;height:4px;border-left:2px solid #1A1A1A;border-right:2px solid #1A1A1A;"></td></tr>

        <!-- How to Earn -->
        <tr>
          <td style="background:#1A1A1A;padding:36px 32px;border:2px solid #1A1A1A;border-top:0;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#FF4F00;letter-spacing:2px;text-transform:uppercase;">For Creators</p>
            <h2 style="margin:0 0 20px;font-size:24px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">Turn your prompts into income.</h2>

            <!-- Step 1 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td width="40" valign="top">
                  <div style="width:32px;height:32px;background:#FF4F00;border:2px solid #FF4F00;text-align:center;line-height:28px;font-size:14px;font-weight:900;color:#fff;">1</div>
                </td>
                <td valign="top" style="padding-left:16px;">
                  <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#FFFFFF;">Upgrade to Creator</p>
                  <p style="margin:0;font-size:14px;color:#AAA;line-height:1.5;">Switch your account to a Creator role and get access to your seller dashboard.</p>
                </td>
              </tr>
            </table>

            <!-- Step 2 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td width="40" valign="top">
                  <div style="width:32px;height:32px;background:#0047FF;border:2px solid #0047FF;text-align:center;line-height:28px;font-size:14px;font-weight:900;color:#fff;">2</div>
                </td>
                <td valign="top" style="padding-left:16px;">
                  <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#FFFFFF;">List Your Prompts</p>
                  <p style="margin:0;font-size:14px;color:#AAA;line-height:1.5;">Upload your best prompts, set your price, and publish them to the marketplace in minutes.</p>
                </td>
              </tr>
            </table>

            <!-- Step 3 -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="40" valign="top">
                  <div style="width:32px;height:32px;background:#F7F5F0;border:2px solid #F7F5F0;text-align:center;line-height:28px;font-size:14px;font-weight:900;color:#1A1A1A;">3</div>
                </td>
                <td valign="top" style="padding-left:16px;">
                  <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#FFFFFF;">Get Paid</p>
                  <p style="margin:0;font-size:14px;color:#AAA;line-height:1.5;">Every time someone buys your prompt using credits, you earn. Request a payout to your bank anytime.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:#F7F5F0;padding:36px 32px;border:2px solid #1A1A1A;border-top:0;text-align:center;">
            <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;">Your account is ready. Start exploring thousands of AI prompts crafted by experts — or list your own and start earning today.</p>
            <a href="https://promptlyi.com/marketplace" style="display:inline-block;background:#FF4F00;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border:2px solid #1A1A1A;letter-spacing:0.2px;">Browse the Marketplace →</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#888;">© 2026 Promptlyi. All rights reserved.</p>
            <p style="margin:0;font-size:12px;color:#888;">Questions? Reply to this email — we actually read them.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`,
        });

        if (result.error) {
            console.error(`[emailService] Resend API Error for ${toEmail}:`, result.error);
            return null;
        }

        console.log(`[emailService] Welcome email sent to ${toEmail}. ID: ${result.data?.id}`);
        return result.data;
    } catch (error) {
        console.error(`[emailService] Failed to send welcome email to ${toEmail}:`, error);
    }
}

module.exports = {
    sendWelcomeEmail,
};
