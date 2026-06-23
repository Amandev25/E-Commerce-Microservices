import dotenv from 'dotenv';
dotenv.config(); // load the .env file

// Read everything from .env once, here, so the rest of the app stays clean.
export default {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
};