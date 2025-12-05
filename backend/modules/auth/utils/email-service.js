const nodemailer = require("nodemailer");

// DEBUG: check environment variables
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS set?", !!process.env.EMAIL_PASS);
console.log("TEST_RECEIVE_EMAIL:", process.env.TEST_RECEIVE_EMAIL);

// Create transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️  Email credentials not configured. OTP emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,  // Use App Password for Gmail
    },
  });
};

// Send OTP Email
const sendOTPEmail = async (email, otp, fullName) => {
  const transporter = createTransporter();

  // OVERRIDE recipient for testing
  const recipient = process.env.TEST_RECEIVE_EMAIL || email;

  if (!transporter) {
    console.log("📧 OTP for development:", otp);
    console.log("📧 Email would be sent to:", recipient);
    return true;
  }

  const mailOptions = {
    from: {
      name: "Hospital Management System",
      address: process.env.EMAIL_USER
    },
    to: recipient, // <- override with your test email
    subject: "Your OTP for Login Verification - Hospital Management System",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .otp-box { background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; }
          .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: monospace; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Hospital Management System</h1>
            <p>Secure Login Verification</p>
          </div>
          <div class="content">
            <h2>Hello ${fullName},</h2>
            <p>Your OTP is:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <div class="warning">
              This OTP expires in 10 minutes. Do not share it.
            </div>
          </div>
          <div class="footer">
            <p>Automated email. Do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${fullName}, Your OTP is: ${otp}. It expires in 10 minutes.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully to:", recipient);
    console.log("📧 Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    if (process.env.NODE_ENV === "development") {
      console.log("📧 OTP for development:", otp);
    }
    throw new Error("Failed to send OTP email. Please try again.");
  }
};

// Send welcome email (kept original behavior)
const sendWelcomeEmail = async (email, fullName, role) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log("📧 Welcome email would be sent to:", email);
    return true;
  }

  const mailOptions = {
    from: { name: "Hospital Management System", address: process.env.EMAIL_USER },
    to: email,
    subject: "Welcome to Hospital Management System! 🎉",
    html: `<p>Hello ${fullName}, welcome to the system! Role: ${role}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent to:", email);
    return true;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error.message);
    return false;
  }
};

module.exports = { sendOTPEmail, sendWelcomeEmail };
