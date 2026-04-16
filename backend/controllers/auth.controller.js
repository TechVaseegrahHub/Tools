import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendOtpEmail } from '../utils/email.js';
import { OAuth2Client } from 'google-auth-library';
import connectDB from '../utils/db.js';

let googleClient;
try {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here') {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
} catch (err) {
  console.warn('Failed to initialize Google OAuth Client:', err.message);
}

// Helper function to generate a token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// @desc    Register a new organization (public — first tenant signup)
// @route   POST /api/auth/register-org
export const registerOrg = async (req, res) => {
  const { orgName, adminName, adminEmail, adminPassword } = req.body;

  if (!orgName || !adminName || !adminEmail || !adminPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create slug from org name
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check org slug uniqueness
    const slugExists = await Organization.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({ message: 'An organization with a similar name already exists' });
    }

    // Check admin email uniqueness
    const emailExists = await User.findOne({ email: adminEmail });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create the org
    const org = await Organization.create({ name: orgName, slug, isActive: true });

    // Create the first admin user for this org
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'Admin',
      orgId: org._id,
    });

    const token = generateToken({ id: admin._id, orgId: org._id, role: admin.role });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      orgId: org._id,
      org: { name: org.name, slug: org.slug },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    Register a new user (Admin creates users for their org)
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user — orgId comes from the logged-in Admin's orgId
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
      orgId: req.user?.orgId, // scoped to caller's org
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        token: generateToken({ id: user._id, orgId: user.orgId, role: user.role }),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Login API Triggered for: ${email}`);

  // Ensure DB is connected before proceeding
  try {
    await connectDB();
  } catch (err) {
    console.error(`[${timestamp}] Login Blocked: DB Connection Failed. ${err.message}`);
    return res.status(503).json({ 
      success: false,
      message: 'DATABASE_OFFLINE: Unable to verify credentials.',
      requirement: 'Please check your MongoDB Atlas IP Whitelist (0.0.0.0/0) and ensure the cluster is active.',
      error: err.message
    });
  }

  try {
    // --- Check SuperAdmin credentials from .env first ---
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (
      superAdminEmail &&
      superAdminPassword &&
      email === superAdminEmail &&
      password === superAdminPassword
    ) {
      console.log(`[${new Date().toISOString()}] SuperAdmin logged in bypassing DB query.`);
      // SuperAdmin login — no DB lookup needed
      const token = generateToken({
        id: 'superadmin',
        role: 'SuperAdmin',
        isSuperAdmin: true,
      });

      return res.json({
        _id: 'superadmin',
        name: 'Super Admin',
        email: superAdminEmail,
        role: 'SuperAdmin',
        isSuperAdmin: true,
        token,
      });
    }

    // --- Normal tenant user login ---
    console.log(`[${new Date().toISOString()}] Executing DB query for user: ${email}`);
    const user = await User.findOne({ email }).populate('orgId', 'name slug isActive');

    if (user && (await user.comparePassword(password))) {
      // Check if the org is still active
      if (user.orgId && !user.orgId.isActive) {
        return res.status(403).json({ message: 'Your organization account is inactive. Please contact support.' });
      }

      const token = generateToken({
        id: user._id,
        orgId: user.orgId?._id,
        role: user.role,
      });

      const responseData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId?._id,
        org: user.orgId ? { name: user.orgId.name, slug: user.orgId.slug } : null,
        token,
      };
      
      console.log('Login Success Response:', JSON.stringify(responseData, null, 2));
      res.json(responseData);
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get current user's profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  // SuperAdmin is not stored in DB
  if (req.user?.isSuperAdmin) {
    return res.json({
      _id: 'superadmin',
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL,
      role: 'SuperAdmin',
      isSuperAdmin: true,
    });
  }

  const user = await User.findById(req.user.id).select('-password').populate('orgId', 'name slug');
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    orgId: user.orgId?._id,
    org: user.orgId ? { name: user.orgId.name, slug: user.orgId.slug } : null,
  });
};

// ─── Forgot Password (OTP) Flow ───────────────────────────────────────────────

// @desc    Step 1 — Send OTP to user email
// @route   POST /api/auth/forgot-password  (public)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return 200 to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, an OTP has been sent.' });

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 8);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpHash = otpHash;
    user.otpExpiry = otpExpiry;
    // Clear any old reset token
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(user.email, otp);
    res.json({ message: 'If that email exists, an OTP has been sent.' });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// @desc    Step 2 — Verify OTP, return short-lived reset token
// @route   POST /api/auth/verify-otp  (public)
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otpHash || !user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(String(otp), user.otpHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

    // OTP verified — issue a short-lived reset token (5 min)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.resetToken = resetTokenHash;
    user.resetTokenExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    res.json({ resetToken, message: 'OTP verified. You can now reset your password.' });
  } catch (error) {
    console.error('verifyOtp error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Step 3 — Reset password with reset token
// @route   POST /api/auth/reset-password  (public)
export const resetPassword = async (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetToken: resetTokenHash,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token.' });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Change own password (authenticated)
// @route   PUT /api/auth/change-password  (private)
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both current and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Google OAuth ──────────────────────────────────────────────────────────────

// Helper: verify Google ID token and return payload
const verifyGoogleToken = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

// @desc    Google Sign-In — login existing user OR signal new-user flow
// @route   POST /api/auth/google
export const googleAuth = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'Google ID token is required' });

  try {
    const payload = await verifyGoogleToken(idToken);
    const { sub: googleId, email, name, picture } = payload;

    // Look up existing user
    const user = await User.findOne({ email: email.toLowerCase() }).populate('orgId', 'name slug isActive');

    if (user) {
      // Existing user — link googleId if not already linked, then log them in
      if (!user.googleId) {
        user.googleId = googleId;
        if (user.authProvider === 'local') user.authProvider = 'google';
        await user.save({ validateBeforeSave: false });
      }

      if (user.orgId && !user.orgId.isActive) {
        return res.status(403).json({ message: 'Your organization account is inactive.' });
      }

      const token = generateToken({ id: user._id, orgId: user.orgId?._id, role: user.role });
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId?._id,
        org: user.orgId ? { name: user.orgId.name, slug: user.orgId.slug } : null,
        token,
      });
    }

    // New user — they need to create an org first
    return res.status(200).json({
      newUser: true,
      googleId,
      name,
      email,
      picture,
    });
  } catch (error) {
    console.error('googleAuth error:', error);
    res.status(401).json({ message: 'Google authentication failed. Please try again.' });
  }
};

// @desc    Google Register Org — create org + admin for a new Google user
// @route   POST /api/auth/google-register-org
export const googleRegisterOrg = async (req, res) => {
  const { idToken, orgName, adminPassword } = req.body;
  if (!idToken || !orgName) {
    return res.status(400).json({ message: 'Google token and organisation name are required' });
  }

  try {
    const payload = await verifyGoogleToken(idToken);
    const { sub: googleId, email, name } = payload;

    // Guard: email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this Google email already exists. Please sign in instead.' });
    }

    // Create org slug
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slugExists = await Organization.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({ message: 'An organisation with a similar name already exists' });
    }

    const org = await Organization.create({ name: orgName, slug, isActive: true });

    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password: adminPassword || (Math.random().toString(36).slice(-10)),
      authProvider: 'google',
      googleId,
      role: 'Admin',
      orgId: org._id,
    });

    const token = generateToken({ id: admin._id, orgId: org._id, role: admin.role });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      orgId: org._id,
      org: { name: org.name, slug: org.slug },
      token,
    });
  } catch (error) {
    console.error('googleRegisterOrg error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};