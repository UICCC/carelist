const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.GOOGLE_SENDER_EMAIL;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

async function sendEmail(to, subject, htmlMessage) {
  try {
    const rawEmail = [
      `From: ${SENDER_EMAIL}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=UTF-8",
      "",
      htmlMessage,
    ].join("\n");

    const encodedEmail = Buffer.from(rawEmail)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedEmail },
    });

    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}

module.exports = sendEmail;
