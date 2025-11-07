const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { username, email, password, githubProfile } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      githubProfile: githubProfile || ''
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        githubProfile: user.githubProfile,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check for user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        githubProfile: user.githubProfile,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('contributions');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether the email exists
      return res.status(200).json({ success: true, message: 'If an account exists for this email, reset instructions have been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Build reset URL that points to the frontend reset route
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // Prepare transporter (expects SMTP env vars)
    let transporter;
    let previewUrl;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const smtpPort = Number(process.env.SMTP_PORT || 587);
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        // Use secure (TLS) for port 465, otherwise allow STARTTLS
        secure: smtpPort === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          // Allow self-signed certs if provider requires it — keep configurable
          rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
        }
      });
    } else {
      // For development: create an Ethereal account and transporter so an email preview URL is available
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (err) {
        console.warn('Failed to create Ethereal test account:', err.message);
        transporter = null;
      }
    }

    const messageText = `You requested a password reset. Click the link to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`;
    const messageHtml = `
      <p>Hello ${user.username || ''},</p>
      <p>You requested a password reset for your CS-Library account. Click the button below to reset your password.</p>
      <p style="margin:28px 0"><a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
      <p>If the button doesn't work, copy and paste the following link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `;

    if (transporter) {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || (process.env.SMTP_USER || 'no-reply@cs-library.local'),
        to: user.email,
        subject: 'Reset your CS-Library password',
        text: messageText,
        html: messageHtml,
      });

      // If using Ethereal, get preview URL
      try {
        const testPreview = nodemailer.getTestMessageUrl(info);
        if (testPreview) previewUrl = testPreview;
      } catch (e) {
        // ignore
      }

      return res.status(200).json({
        success: true,
        message: 'If an account exists for this email, reset instructions have been sent.',
        resetUrl,
        previewUrl
      });
    }

    // If transporter could not be created, return the reset URL in the response for testing
    return res.status(200).json({
      success: true,
      message: 'No SMTP available — returning reset link in response for testing.',
      resetUrl
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and password are required' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = password; // will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password has been reset' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});