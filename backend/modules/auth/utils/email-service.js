const { google } = require("googleapis");
const nodemailer = require("nodemailer");

// OAuth2 setup
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // redirect URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Create transporter using OAuth2
const createTransporter = async () => {
  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: SENDER_EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });
};

// ------------------------------
// Send OTP Email
// ------------------------------
const sendOTPEmail = async (email, otp, fullName) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `"Hospital Management System" <${SENDER_EMAIL}>`,
    to: email,
    subject: "Your OTP for Login Verification - Hospital Management System",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hello ${fullName},</h2>
        <p>Your OTP is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">${otp}</div>
        <p style="color: #ff0000;">This OTP expires in 10 minutes. Do not share it.</p>
      </div>
    `,
    text: `Hello ${fullName}, Your OTP is: ${otp}. It expires in 10 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent to:", email);
    console.log("📧 Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    throw new Error("Failed to send OTP email. Please try again.");
  }
};

// ------------------------------
// Send Welcome Email
// ------------------------------
const sendWelcomeEmail = async (email, fullName, role) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `"Hospital Management System" <${SENDER_EMAIL}>`,
    to: email,
    subject: "Welcome to Hospital Management System! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hello ${fullName},</h2>
        <p>Welcome to the system! Your role: <strong>${role}</strong></p>
        <p>We are excited to have you onboard.</p>
      </div>
    `,
    text: `Hello ${fullName}, Welcome to the system! Role: ${role}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent to:", email);
    console.log("📧 Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error.message);
    throw new Error("Failed to send welcome email.");
  }
};

module.exports = { sendOTPEmail, sendWelcomeEmail };
