import app from './app.js';
import config from './config/env.js';
import connectDB from './config/db.js';

// Connect to MongoDB FIRST, then start accepting requests — so we never announce
// "Server running" while the database is actually down.
const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
  });
};

start();