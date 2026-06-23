import jwt from 'jsonwebtoken';
import config from '../config/env.js';

// Short-lived token, sent on every request to prove who you are.
export const generateAccessToken = (userId, role) =>
  jwt.sign({ sub: userId, role }, config.jwtSecret, { expiresIn: '15m' });

// Long-lived token, used only to get a fresh access token.
export const generateRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, config.jwtRefreshSecret, { expiresIn: '7d' });