import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/env.js';
import authRoutes from './routes/v1/auth.routes.js';

const app = express();

app.use(helmet());                       // security headers
app.use(express.json());                 // read JSON request bodies
app.use(cookieParser());                 // read cookies
app.use(cors({ origin: config.clientUrl, credentials: true })); // allow your frontend + cookies
app.use(morgan('dev'));                  // log requests in the terminal

// A simple test route
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// All auth routes live under /api/v1/auth
app.use('/api/v1/auth', authRoutes);

// If no route matched -> 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// If something unexpected threw -> 500
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong' });
});

export default app;