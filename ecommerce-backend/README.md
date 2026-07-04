# Marlowe — E-Commerce Backend

A REST API for a full e-commerce store: auth, catalog, cart, wishlist, reviews, coupons,
orders, and payments. Built with **Node.js, Express 5, and MongoDB**.

The React storefront that consumes this API lives in [`../ecommerce-frontend`](../ecommerce-frontend).

## Tech stack

Node.js · Express 5 · MongoDB + Mongoose · JWT · bcrypt · Razorpay · Cloudinary · Multer · Helmet · express-rate-limit

## Getting started

```bash
npm install
# create a .env file (see "Environment variables" below)
npm run seed     # optional: load demo products, categories, coupon & demo users
npm run dev      # start with auto-reload on http://localhost:5000
```

### Scripts

| Script | Does |
|--------|------|
| `npm run dev` | Start the server with nodemon (auto-reload) |
| `npm start` | Start the server (production) |
| `npm run seed` | Fill the database with demo data |

### Environment variables

Create a `.env` file in this folder with:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=<your MongoDB Atlas connection string>

JWT_ACCESS_SECRET=<random secret>
JWT_REFRESH_SECRET=<a different random secret>

CLOUDINARY_CLOUD_NAME=<...>
CLOUDINARY_API_KEY=<...>
CLOUDINARY_API_SECRET=<...>

RAZORPAY_KEY_ID=<...>
RAZORPAY_KEY_SECRET=<...>
RAZORPAY_WEBHOOK_SECRET=<...>

# Optional: override DNS resolvers (helps if your network can't resolve
# mongodb+srv SRV records — see src/config/db.js)
# DNS_SERVERS=8.8.8.8,1.1.1.1
```

Generate a secret with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

> ⚠️ Never commit `.env`. It's in `.gitignore` for a reason.

## Project structure

```
src/
├─ server.js          → boots the DB connection, then starts the server
├─ app.js             → Express app: middleware + route mounting
├─ config/            → env, db, cloudinary, razorpay
├─ models/            → Mongoose schemas (User, Product, Order, …)
├─ controllers/       → request handlers (business logic)
├─ routes/v1/         → route → controller wiring
├─ middleware/        → auth (JWT), isAdmin, upload (Multer)
├─ utils/             → ApiError, asyncHandler, token, helpers
└─ seed.js            → demo data seeder
```

## API reference

Base URL: `http://localhost:5000/api/v1`

Auth is via a **Bearer access token** (`Authorization: Bearer <token>`). Some routes are
**admin-only**. The refresh token is sent as an httpOnly cookie.

### Auth — `/auth`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/register` | Public | Create an account |
| POST | `/login` | Public | Log in, returns an access token |
| POST | `/refresh` | Cookie | Get a new access token |
| POST | `/logout` | Public | Clear the refresh cookie |
| GET | `/me` | User | Current user's profile |

### Categories — `/categories`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Public | List categories |
| GET | `/:slug` | Public | Get one by slug |
| POST | `/` | Admin | Create |
| PUT | `/:id` | Admin | Update |
| DELETE | `/:id` | Admin | Delete |

### Products — `/products`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Public | List with `keyword`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| GET | `/:id` | Public | Get one product |
| POST | `/` | Admin | Create |
| PUT | `/:id` | Admin | Update |
| DELETE | `/:id` | Admin | Delete |
| POST | `/:id/images` | Admin | Upload images (Cloudinary) |
| GET | `/:productId/reviews` | Public | List a product's reviews |
| POST | `/:productId/reviews` | User | Add a review |

### Cart — `/cart`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | User | Get my cart |
| POST | `/items` | User | Add an item |
| PUT | `/items/:productId` | User | Set an item's quantity |
| DELETE | `/items/:productId` | User | Remove an item |
| DELETE | `/` | User | Clear the cart |

### Reviews — `/reviews`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| PUT | `/:id` | Owner | Edit your review |
| DELETE | `/:id` | Owner/Admin | Delete a review |

### Wishlist — `/wishlist`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | User | Get my wishlist |
| POST | `/:productId` | User | Toggle a product on/off |
| DELETE | `/:productId` | User | Remove a product |
| DELETE | `/` | User | Clear the wishlist |

### Coupons — `/coupons`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/apply` | User | Preview a coupon against my cart |
| POST | `/` | Admin | Create |
| GET | `/` | Admin | List |
| PUT | `/:id` | Admin | Update |
| DELETE | `/:id` | Admin | Delete |

### Orders — `/orders`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/` | User | Place an order from the cart |
| GET | `/my` | User | My order history |
| GET | `/:id` | Owner/Admin | Get one order |
| GET | `/` | Admin | List all orders |
| PUT | `/:id/status` | Admin | Update order status |

### Payments — `/payments`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/create-order` | User | Create a Razorpay order |
| POST | `/verify` | User | Verify the payment signature |
| POST | `/webhook` | Razorpay | Webhook (raw body, HMAC-verified) |

## Notable implementation details

- **Anti-overselling:** placing an order runs inside a MongoDB **transaction** and
  decrements stock with an atomic conditional update
  (`updateOne({ stock: { $gte: qty } }, { $inc: { stock: -qty } })`).
- **Payment integrity:** the Razorpay signature is re-computed with HMAC-SHA256 and
  verified; both `/verify` and the webhook are **idempotent** so a payment is only applied once.
- **Coupons** are validated at apply time but only **consumed at order time**, inside the
  transaction, so usage limits can't be bypassed.
- **Price snapshots:** the cart stores the server-side price when an item is added — the
  client can never send its own price.

## Demo logins (after `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| Customer | `priya@marlowe.test` | `password123` |
| Admin | `admin@marlowe.test` | `password123` |
