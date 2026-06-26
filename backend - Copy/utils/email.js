const nodemailer = require('nodemailer');

// Configure transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
});

const sendEmail = async ({ to, subject, html }) => {
  // If SMTP is not properly configured, just log to console
  if (!process.env.SMTP_HOST) {
    console.log('\n=================== EMAIL SIMULATOR ===================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Body:');
    console.log(html);
    console.log('========================================================\n');
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Klare Homes'}" <${process.env.FROM_EMAIL || 'noreply@klarehomes.com'}>`,
      to,
      subject,
      html
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendEmail
};
