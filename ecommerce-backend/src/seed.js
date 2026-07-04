// Seed script — fills the database with demo data so the storefront looks alive.
// Run it with:  node src/seed.js
//
// It is SAFE to re-run: it only removes the specific demo items it created
// (matched by name / email / code), never your other data.
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Category from './models/category.model.js';
import Product from './models/product.model.js';
import User from './models/user.model.js';
import Review from './models/review.model.js';
import Coupon from './models/coupon.model.js';
import updateProductRating from './utils/updateProductRating.js';

// --- The demo catalog (mirrors the Marlowe design) ---
const CATEGORIES = [
  { name: 'Home & Living', description: 'Furniture, lighting and décor.' },
  { name: 'Kitchen', description: 'Everyday kitchen essentials.' },
  { name: 'Tech', description: 'Audio, wearables and gadgets.' },
  { name: 'Apparel', description: 'Clothing and accessories.' },
  { name: 'Beauty', description: 'Skincare and self-care.' },
  { name: 'Outdoors', description: 'Plants and outdoor living.' },
];

const PRODUCTS = [
  { name: 'Terra Ceramic Mug', category: 'Kitchen', price: 24, stock: 60, rating: 4.8, reviews: 126, description: 'A hand-glazed stoneware mug that keeps drinks warm and feels great in the hand.' },
  { name: 'Alba Lounge Chair', category: 'Home & Living', price: 389, stock: 15, rating: 4.6, reviews: 54, description: 'A mid-century lounge chair with a solid oak frame and boucle upholstery.' },
  { name: 'Halo Desk Lamp', category: 'Home & Living', price: 89, stock: 40, rating: 4.9, reviews: 212, description: 'A dimmable LED desk lamp with a warm glow and a minimal aluminium body.' },
  { name: 'Everyday Cotton Tee', category: 'Apparel', price: 32, stock: 120, rating: 4.4, reviews: 88, description: 'A soft, breathable 100% organic cotton tee cut for an everyday relaxed fit.' },
  { name: 'Pure Glow Serum', category: 'Beauty', price: 48, stock: 75, rating: 4.7, reviews: 301, description: 'A lightweight vitamin-C serum that brightens and hydrates without residue.' },
  { name: 'Nova Wireless Headphones', category: 'Tech', price: 149, stock: 30, rating: 4.5, reviews: 167, description: 'Adaptive noise cancellation, 40-hour battery, and plush memory-foam cushions. Tuned for balanced audio whether you are on a call or lost in a playlist.' },
  { name: 'Fern Potted Plant', category: 'Outdoors', price: 38, stock: 50, rating: 4.8, reviews: 73, description: 'A lush indoor fern in a matte ceramic pot — easy to care for, hard to kill.' },
  { name: 'Ember Soy Candle', category: 'Home & Living', price: 22, stock: 90, rating: 4.9, reviews: 145, description: 'A hand-poured soy candle with notes of cedar and warm amber. 50-hour burn.' },
  { name: 'Voyage Canvas Tote', category: 'Apparel', price: 58, stock: 65, rating: 4.6, reviews: 61, description: 'A durable waxed-canvas tote with a leather base and room for everything.' },
  { name: 'Momentum Steel Watch', category: 'Tech', price: 219, stock: 25, rating: 4.7, reviews: 98, description: 'A stainless-steel automatic watch with a sapphire crystal and 5-year warranty.' },
];

const USERS = [
  { name: 'Admin', email: 'admin@marlowe.test', password: 'password123', role: 'admin' },
  { name: 'Priya Sharma', email: 'priya@marlowe.test', password: 'password123', role: 'user' },
  { name: 'Marcus Lee', email: 'marcus@marlowe.test', password: 'password123', role: 'user' },
  { name: 'Aisha Rahman', email: 'aisha@marlowe.test', password: 'password123', role: 'user' },
];

async function seed() {
  await connectDB();
  console.log('Seeding demo data…');

  // 1) Categories — upsert by name so ids stay stable across re-runs.
  const categoryByName = {};
  for (const c of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { name: c.name },
      { name: c.name, description: c.description },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    // Make sure the slug exists (upsert skips the pre-save hook).
    if (!doc.slug) {
      doc.slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await doc.save();
    }
    categoryByName[c.name] = doc._id;
  }

  // 2) Products — replace the demo ones by name.
  const names = PRODUCTS.map((p) => p.name);
  await Product.deleteMany({ name: { $in: names } });
  const productByName = {};
  for (const p of PRODUCTS) {
    const doc = await Product.create({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: categoryByName[p.category],
      images: [], // no photos — the frontend shows a nice icon fallback
      averageRating: p.rating,
      numReviews: p.reviews,
    });
    productByName[p.name] = doc._id;
  }

  // 3) Users — recreate the demo accounts (password gets hashed by the model).
  const emails = USERS.map((u) => u.email);
  await User.deleteMany({ email: { $in: emails } });
  const userByEmail = {};
  for (const u of USERS) {
    const doc = await User.create(u);
    userByEmail[u.email] = doc._id;
  }

  // 4) A few real reviews for the headphones so the reviews section is populated.
  const headphonesId = productByName['Nova Wireless Headphones'];
  await Review.deleteMany({ product: headphonesId });
  await Review.create([
    { user: userByEmail['priya@marlowe.test'], product: headphonesId, rating: 5, comment: 'Genuinely impressed with the sound isolation. Battery easily lasts my whole workday and the case feels premium.' },
    { user: userByEmail['marcus@marlowe.test'], product: headphonesId, rating: 4, comment: 'Great everyday headphones. Comfortable for long calls. Docked a star only because the app could be more intuitive.' },
    { user: userByEmail['aisha@marlowe.test'], product: headphonesId, rating: 5, comment: 'Beautiful matte finish and the fit is snug without being tight. Pairs instantly with every device I own.' },
  ]);
  // Recompute the headphones rating from those real reviews.
  await updateProductRating(headphonesId);

  // 5) The WELCOME15 coupon from the design.
  await Coupon.deleteMany({ code: 'WELCOME15' });
  await Coupon.create({
    code: 'WELCOME15',
    type: 'percent',
    value: 15,
    minCartValue: 0,
    maxDiscount: null,
    usageLimit: null,
    expiresAt: new Date('2030-12-31'),
    isActive: true,
  });

  console.log(`✅ Seeded ${CATEGORIES.length} categories, ${PRODUCTS.length} products, ${USERS.length} users, 3 reviews, 1 coupon.`);
  console.log('   Demo logins:  priya@marlowe.test / password123   (customer)');
  console.log('                 admin@marlowe.test / password123   (admin)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
