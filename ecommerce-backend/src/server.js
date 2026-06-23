import app from './app.js';
import config from './config/env.js';
import connectDB from './config/db.js';

connectDB(); // connect to MongoDB

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});