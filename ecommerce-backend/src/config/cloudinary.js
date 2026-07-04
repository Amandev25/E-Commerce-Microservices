import { v2 as cloudinary } from 'cloudinary';
import config from './env.js';

// Tell the SDK who we are. It uses these on every upload.
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export default cloudinary;