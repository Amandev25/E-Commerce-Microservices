# 🛍️ Marlowe — Full-Stack E-Commerce

A complete, production-quality e-commerce application — a REST API backend and a modern
React storefront — built as a portfolio project.

> **Everyday things, thoughtfully made.** Browse products, manage a cart & wishlist, apply
> coupons, and check out with real Razorpay payments.

![Node](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2451?logo=razorpay&logoColor=white)

---

## ✨ Features

**Storefront**
- Product catalog with **search, category & price filters, sorting, and pagination**
- Product detail pages with image gallery, ratings, and a **write-a-review** flow
- **Cart** with live quantity updates and server-verified pricing
- **Wishlist** you can toggle from any product
- **Coupons** (`WELCOME15` → 15% off) applied at checkout
- **Checkout** with shipping details and **Razorpay** payment
- **Order history** with live status badges
- JWT auth with login, register, and one-click **demo access**

**Under the hood (the interesting engineering)**
- **Transactional checkout** with an **atomic conditional stock decrement** — prevents
  overselling even under concurrent orders
- **Idempotent payment verification** (HMAC signature check) + a **webhook** backup path
- **JWT access + refresh tokens** (refresh stored in an httpOnly cookie) with role-based
  access control (user / admin)
- **Server-side price snapshots** — the client can never dictate prices
- Product ratings recomputed from reviews via a **MongoDB aggregation pipeline**
- Security middleware: Helmet, CORS, and rate limiting

---

## 🧱 Tech stack

| Layer | Tech |
|-------|------|
| **Backend** | Node.js, Express 5, MongoDB, Mongoose, JWT, bcrypt, Razorpay, Cloudinary, Multer, Helmet |
| **Frontend** | React, Vite, Tailwind CSS, React Router, Axios |
| **Database** | MongoDB Atlas |

---

## 📁 Repository structure

```
E-Commerce/
├─ ecommerce-backend/    → REST API (Express + MongoDB)   — see its own README
└─ ecommerce-frontend/   → React storefront (Vite + Tailwind) — see its own README
```

---

## 🚀 Getting started

### 1. Backend

```bash
cd ecommerce-backend
npm install
# create a .env file (see ecommerce-backend/README.md for the required variables)
npm run seed     # loads demo products, categories, a coupon & demo users
npm run dev      # API on http://localhost:5000
```

### 2. Frontend

```bash
cd ecommerce-frontend
npm install
npm run dev      # storefront on http://localhost:3000
```

> The frontend runs on **port 3000** because the backend's CORS is locked to that origin
> (`CLIENT_URL`), which is what keeps the login cookie working.

### Demo logins

| Role | Email | Password |
|------|-------|----------|
| Customer | `priya@marlowe.test` | `password123` |
| Admin | `admin@marlowe.test` | `password123` |

Try the coupon **`WELCOME15`** at checkout for 15% off.

---



## 📄 License

This is a demo / portfolio project — not a real store.
