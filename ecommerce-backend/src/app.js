import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import config from './config/env.js';
import authRoutes from './routes/v1/auth.routes.js';
import categoryRoutes from './routes/v1/category.routes.js';
import productRoutes from './routes/v1/product.routes.js';
import cartRoutes from './routes/v1/cart.routes.js';
import reviewRoutes from './routes/v1/review.routes.js';
import wishlistRoutes from './routes/v1/wishlist.routes.js';
import couponRoutes from './routes/v1/coupon.routes.js';
import orderRoutes from './routes/v1/order.routes.js';
import paymentRoutes from './routes/v1/payment.routes.js';
import { razorpayWebhook } from './controllers/payment.controller.js';

const app = express();

app.use(helmet());   // security headers

// The webhook needs the RAW body to verify Razorpay's signature, so it must be
// registered BEFORE express.json() parses the body into an object.
app.post('/api/v1/payments/webhook', express.raw({ type: '*/*' }), razorpayWebhook);

app.use(express.json());                 // read JSON request bodies
app.use(cookieParser());                 // read cookies
app.use(cors({ origin: config.clientUrl, credentials: true })); // allow your frontend + cookies
app.use(morgan('dev'));                  // log requests in the terminal

// Basic rate limiting — 300 requests per 15 min per IP for the whole API.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', apiLimiter);

// A simple test route
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// All auth routes live under /api/v1/auth
app.use('/api/v1/auth', authRoutes);

// All category routes live under /api/v1/categories
app.use('/api/v1/categories', categoryRoutes);

// product routes ...
app.use('/api/v1/products', productRoutes);

// cart routes ...
app.use('/api/v1/cart', cartRoutes);

// review Routes..
app.use('/api/v1/reviews', reviewRoutes);

// coupon Routes..
app.use('/api/v1/coupons', couponRoutes);

// wishlist Routes..
app.use('/api/v1/wishlist', wishlistRoutes);

// order Routes..
app.use('/api/v1/orders', orderRoutes);

// Payment Routes..
app.use('/api/v1/payments', paymentRoutes);
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