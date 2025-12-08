const sendEmail = require("./sendEmail"); // the OAuth utility we created

// Send OTP Email
const sendOTPEmail = async (email, otp, fullName) => {
  const subject = "Your OTP for Login Verification - Hospital Management System";
  const htmlMessage = `
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
  `;
  return await sendEmail(email, subject, htmlMessage);
};

// Send welcome email
const sendWelcomeEmail = async (email, fullName, role) => {
  const subject = "Welcome to Hospital Management System! 🎉";
  const htmlMessage = `<p>Hello ${fullName}, welcome to the system! Role: ${role}</p>`;
  return await sendEmail(email, subject, htmlMessage);
};

module.exports = { sendOTPEmail, sendWelcomeEmail };
