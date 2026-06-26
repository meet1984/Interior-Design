const generateLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@400;600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: 'Inter', Helvetica, Arial, sans-serif; color: #111111;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
    <div style="background-color: #111111; padding: 30px; text-align: left; border-top: 4px solid #C1121F; border-bottom: 1px solid #000000;">
      <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/email-logo.jpg" alt="Klare Homes" style="height: 100px; width: auto; display: block; margin: 0;" />
    </div>
    <div style="padding: 40px;">
      ${content}
    </div>
    <div style="background-color: #F9F9F9; padding: 24px; text-align: center; border-top: 1px solid #EEEEEE;">
      <p style="margin: 0; font-size: 12px; color: #888888; letter-spacing: 1px; text-transform: uppercase;">Klare Homes · Interior Atelier</p>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #AAAAAA;">Maximilianstraße 45, 80539 München, Germany</p>
    </div>
  </div>
</body>
</html>
`;

const generateOtpEmail = (name, otp, contextMessage) => {
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: 600; color: #111111;">Verification Required</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #555555;">Dear ${name},</p>
    <p style="font-size: 15px; line-height: 1.6; color: #555555;">${contextMessage}</p>
    <div style="margin: 30px 0; text-align: center;">
      <div style="display: inline-block; padding: 15px 30px; background-color: #F9F9F9; border: 1px solid #EEEEEE; border-radius: 6px;">
        <span style="font-family: monospace; font-size: 28px; font-weight: 600; letter-spacing: 4px; color: #C1121F;">${otp}</span>
      </div>
    </div>
    <p style="font-size: 14px; line-height: 1.6; color: #888888;">This code will expire in 10 minutes. If you did not request this, please safely ignore this email.</p>
  `;
  return generateLayout(content);
};

const generateWelcomeEmail = (name) => {
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: 600; color: #111111;">Welcome to Klare Homes</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #555555;">Dear ${name},</p>
    <p style="font-size: 15px; line-height: 1.6; color: #555555;">Thank you for verifying your email. We are thrilled to welcome you to Klare Homes.</p>
    <p style="font-size: 15px; line-height: 1.6; color: #555555;">Your account is now fully active. You can log in to view your projects, access exclusive collections, and communicate directly with our design team.</p>
    <div style="margin: 35px 0 20px;">
      <a href="${process.env.FRONTEND_URL || 'klarehomes.com'}/login" style="display: inline-block; padding: 12px 24px; background-color: #C1121F; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 4px; letter-spacing: 0.5px;">Sign In to Studio</a>
    </div>
  `;
  return generateLayout(content);
};

const generateInquiryAcknowledgementEmail = (name) => {
  const businessPhone = process.env.WHATSAPP_NUMBER || '919319919131';
  const whatsappLink = `<a href="https://wa.me/${businessPhone}" style="display: inline-block; margin-top: 15px; padding: 12px 24px; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 4px; letter-spacing: 0.5px;">Chat with us on WhatsApp</a>`;

  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: 600; color: #111111;">Inquiry Received</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #555555;">Dear ${name},</p>
    <p style="font-size: 15px; line-height: 1.6; color: #555555;">Thank you for reaching out to Klare Homes. We have received your inquiry and our design team will review it shortly.</p>
    <p style="font-size: 15px; line-height: 1.6; color: #555555;">One of our representatives will get back to you as soon as possible. If you need immediate assistance, feel free to reach out to us directly:</p>
    <div style="margin: 30px 0 20px; padding: 15px; background-color: #F9F9F9; border-left: 4px solid #C1121F;">
      <p style="margin: 5px 0;"><strong>Phone / WhatsApp:</strong> +${businessPhone}</p>
      <p style="margin: 5px 0;"><strong>Address:</strong> Maximilianstraße 45, 80539 München, Germany</p>
    </div>
    <div style="margin: 30px 0 20px;">
      ${whatsappLink}
    </div>
  `;
  return generateLayout(content);
};

const generateAdminInquiryNotificationEmail = (name, email, subject, inquiryType, phone, productName, collectionName) => {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const whatsappLink = cleanPhone ? `<a href="https://wa.me/${cleanPhone}" style="display: inline-block; padding: 12px 24px; margin: 5px; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 4px; letter-spacing: 0.5px; vertical-align: middle; line-height: 1.5;">Message on WhatsApp</a>` : '';

  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: 600; color: #111111;">New Inquiry Received</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #555555;">A new inquiry has been submitted on the website.</p>
    <div style="margin: 20px 0; padding: 15px; background-color: #F9F9F9; border-left: 4px solid #C1121F;">
      <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p style="margin: 5px 0;"><strong>Type:</strong> ${inquiryType}</p>
      <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
      ${productName !== 'N/A' ? `<p style="margin: 5px 0; margin-top: 15px; padding-top: 15px; border-top: 1px solid #EBEBEB;"><strong>Target Product:</strong> ${productName}</p>` : ''}
      ${collectionName !== 'N/A' ? `<p style="margin: 5px 0;"><strong>Collection:</strong> ${collectionName}</p>` : ''}
    </div>
    <div style="margin: 35px 0 20px; text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/inquiries" style="display: inline-block; padding: 12px 24px; margin: 5px; background-color: #C1121F; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 4px; letter-spacing: 0.5px; vertical-align: middle; line-height: 1.5;">View in Admin Panel</a>
      ${whatsappLink}
    </div>
  `;
  return generateLayout(content);
};

module.exports = {
  generateOtpEmail,
  generateWelcomeEmail,
  generateInquiryAcknowledgementEmail,
  generateAdminInquiryNotificationEmail
};
