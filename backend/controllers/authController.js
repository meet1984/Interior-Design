const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../models');
const { logActivity } = require('../utils/logger');
const { sendEmail } = require('../utils/email');

// Generate access & refresh tokens
const generateTokens = (user, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '7d');
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role.name },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  return token;
};

// Register client user
const register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if email already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Get the client role
    const clientRole = await db.Role.findOne({ where: { name: 'client' } });
    if (!clientRole) {
      return res.status(500).json({ success: false, message: 'Client role not configured in database' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.User.create({
      roleId: clientRole.id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      status: 'unverified'
    });

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.Otp.create({
      email,
      otp: otpCode,
      type: 'registration',
      expiresAt
    });

    // Send Email
    await sendEmail({
      to: email,
      subject: 'Verify Your Signature Studio Account',
      html: `
        <h2>Welcome to Signature Studio!</h2>
        <p>Dear ${firstName},</p>
        <p>Your verification code is: <strong>${otpCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    });

    await logActivity(newUser.id, 'user_registered', `Registered account: ${newUser.email} (Pending Verification)`, req);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. Please check your email for the OTP.',
      email: newUser.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    // Find user with role
    const user = await db.User.findOne({
      where: { email },
      include: [{ model: db.Role, as: 'role' }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: `Your account is ${user.status}. Access denied.` });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateTokens(user, rememberMe);

    await logActivity(user.id, 'user_login', `Logged in from IP: ${req.ip}`, req);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// Get current profile
const getProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role.name,
        avatar: req.user.avatar,
        status: req.user.status
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// Update profile details
const updateProfile = async (req, res) => {
  const { firstName, lastName, phone, otp } = req.body;

  try {
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required to update profile' });
    }

    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify OTP
    const otpRecord = await db.Otp.findOne({
      where: { email: user.email, otp, type: 'profile_update' }
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();
    
    // Delete used OTP
    await db.Otp.destroy({ where: { email: user.email, type: 'profile_update' } });

    // Fetch updated user with role
    const updatedUser = await db.User.findByPk(user.id, {
      include: [{ model: db.Role, as: 'role' }]
    });

    await logActivity(updatedUser.id, 'profile_updated', 'Updated profile information', req);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role.name,
        avatar: updatedUser.avatar,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// Request Profile Update OTP
const requestProfileUpdateOtp = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await db.Otp.destroy({ where: { email: user.email, type: 'profile_update' } });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.Otp.create({
      email: user.email,
      otp: otpCode,
      type: 'profile_update',
      expiresAt
    });

    await sendEmail({
      to: user.email,
      subject: 'Profile Update Verification',
      html: `
        <h2>Profile Update Request</h2>
        <p>Your verification code to update your profile is: <strong>${otpCode}</strong></p>
        <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      `
    });

    return res.status(200).json({ success: true, message: 'OTP sent to email.' });
  } catch (error) {
    console.error('Request profile OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error requesting OTP' });
  }
};

// Forgot password OTP generator
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email address' });
    }

    // Delete existing forgot_password OTPs for this email to prevent spam
    await db.Otp.destroy({ where: { email, type: 'forgot_password' } });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await db.Otp.create({
      email,
      otp: otpCode,
      type: 'forgot_password',
      expiresAt
    });

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>Your password reset code is: <strong>${otpCode}</strong></p>
        <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      `
    });
    
    await logActivity(user.id, 'forgot_password_requested', 'Password reset OTP generated', req);

    return res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error during forgot password' });
  }
};

// Logout activity logging
const logout = async (req, res) => {
  try {
    if (req.user) {
      await logActivity(req.user.id, 'user_logout', 'User logged out of session', req);
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

// Verify Registration OTP
const verifyRegistrationOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const otpRecord = await db.Otp.findOne({
      where: { email, otp, type: 'registration' }
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Update user status
    const user = await db.User.findOne({
      where: { email },
      include: [{ model: db.Role, as: 'role' }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'active';
    await user.save();

    // Delete OTP record
    await db.Otp.destroy({ where: { email, type: 'registration' } });

    // Generate token
    const token = generateTokens(user, false);

    await logActivity(user.id, 'user_verified', `Verified account: ${user.email}`, req);

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        avatar: user.avatar,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

// Resend OTP
const resendOtp = async (req, res) => {
  const { email, type } = req.body; // type: 'registration' or 'forgot_password'

  try {
    if (!email || !type) {
      return res.status(400).json({ success: false, message: 'Email and type are required' });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (type === 'registration' && user.status === 'active') {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    await db.Otp.destroy({ where: { email, type } });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.Otp.create({
      email,
      otp: otpCode,
      type,
      expiresAt
    });

    let subject = 'Your OTP Code';
    let html = `<p>Your code is: <strong>${otpCode}</strong></p>`;

    if (type === 'registration') {
      subject = 'Verify Your Signature Studio Account';
      html = `<h2>Welcome!</h2><p>Your new verification code is: <strong>${otpCode}</strong></p><p>Expires in 10 minutes.</p>`;
    } else if (type === 'forgot_password') {
      subject = 'Password Reset Request';
      html = `<h2>Password Reset</h2><p>Your new reset code is: <strong>${otpCode}</strong></p><p>Expires in 10 minutes.</p>`;
    }

    await sendEmail({ to: email, subject, html });

    return res.status(200).json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error resending OTP' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    const otpRecord = await db.Otp.findOne({
      where: { email, otp, type: 'forgot_password' }
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await db.Otp.destroy({ where: { email, type: 'forgot_password' } });

    await logActivity(user.id, 'password_reset', 'Password reset successfully', req);

    return res.status(200).json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  requestProfileUpdateOtp,
  forgotPassword,
  verifyRegistrationOtp,
  resendOtp,
  resetPassword,
  logout
};
