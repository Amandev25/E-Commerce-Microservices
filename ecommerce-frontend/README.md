# Marlowe — E-Commerce Frontend

A React storefront for the [ecommerce-backend](../ecommerce-backend) API, built to match the
"Marlowe" design (warm editorial DTC store with a forest-green accent).

Built with **Vite + React + Tailwind CSS**, plain JavaScript, and beginner-friendly code.

## Screens

| Route | Screen |
|-------|--------|
| `/` | Home — hero, category shortcuts, promo banner, featured products |
| `/products` | Product listing — search, category / price filters, sort, pagination |
| `/products/:id` | Product detail — gallery, buy box, reviews + write-a-review |
| `/cart` | Cart — line items, coupon apply, order summary |
| `/checkout` | Checkout — shipping form + Razorpay payment |
| `/orders` | Order history with status badges |
| `/wishlist` | Saved products |
| `/login`, `/register` | Auth (with one-click demo login) |

## Prerequisites

The backend must be running and seeded first:

```bash
cd ../ecommerce-backend
npm install
npm run seed     # loads demo products, categories, coupon & demo users
npm run dev      # starts the API on http://localhost:5000
```

## Run the frontend

```bash
npm install
npm run dev      # starts on http://localhost:3000
```

> The dev server runs on **port 3000** on purpose — the backend's CORS only allows
> `http://localhost:3000` (its `CLIENT_URL`), which is what lets the login cookie work.

Then open http://localhost:3000.

## Demo logins

Use the **"Try as customer"** / **"Try as admin"** buttons on the login page, or sign in with:

| Role | Email | Password |
|------|-------|----------|
| Customer | `priya@marlowe.test` | `password123` |
| Admin | `admin@marlowe.test` | `password123` |

Coupon to try at checkout: **`WELCOME15`** (15% off).

## How it's organised

```
src/
├─ api/         one small file per backend resource (auth, products, cart…)
├─ context/     shared state: Auth, Cart, Wishlist, Toast
├─ components/  reusable UI (Navbar, ProductCard, StarRating, Icons…)
├─ pages/       one file per screen
├─ lib/         tiny helpers (money formatting, etc.)
└─ App.jsx      all the routes
```

### How data flows (the short version)

1. `src/api/client.js` is one axios instance pointing at the backend. It automatically
   attaches your login token to every request.
2. Each page calls a function from `src/api/*` and stores the result in React state.
3. Cart, wishlist and login state live in **context** so the navbar badges and every page
   stay in sync.
