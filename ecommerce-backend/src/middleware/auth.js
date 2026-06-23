import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/user.model.js';

// Runs before protected routes. If the token is valid, it attaches the user to req.
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    // The header should look like: "Bearer eyJhbGc..."
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Please log in first' });
    }

    const token = header.split(' ')[1]; // grab the part after "Bearer "
    const decoded = jwt.verify(token, config.jwtSecret); // throws if invalid/expired

    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User no longer active' });
    }

    req.user = user; // now the controller can use req.user
    next();          // continue to the controller
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};