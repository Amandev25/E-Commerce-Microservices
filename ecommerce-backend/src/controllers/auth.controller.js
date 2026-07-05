import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/user.model.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';

// Settings for the refresh-token cookie (reused below).
const isProd = config.nodeEnv === 'production';
const cookieOptions = {
  httpOnly: true,                       // JavaScript can't read it (safer)
  secure: isProd,                       // HTTPS-only in production
  // In production the frontend and backend live on different domains, so the
  // cookie must be SameSite=None (which also requires Secure) to be sent.
  // Locally, 'strict' is fine and a bit safer.
  sameSite: isProd ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days
};

// REGISTER -------------------------------------------------
export const register = async (req, res) => {
  try {
    // Only take the fields we expect. This stops someone sending role:"admin".
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password }); // password is hashed automatically

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// LOGIN ----------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Password is hidden by default, so we ask for it explicitly with .select('+password')
    const user = await User.findOne({ email }).select('+password');

    // Same message for "no user" and "wrong password" — don't reveal which one.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// REFRESH --------------------------------------------------
export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken; // comes from the cookie automatically
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = jwt.verify(token, config.jwtRefreshSecret);
    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User no longer active' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    return res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// LOGOUT ---------------------------------------------------
export const logout = async (req, res) => {
  res.clearCookie('refreshToken', cookieOptions);
  return res.status(200).json({ success: true, message: 'Logged out' });
};

// ME (current user's profile) ------------------------------
export const me = async (req, res) => {
  // req.user was set by the authenticate middleware.
  const { _id, name, email, role } = req.user;
  return res.status(200).json({
    success: true,
    data: { id: _id, name, email, role },
  });
};