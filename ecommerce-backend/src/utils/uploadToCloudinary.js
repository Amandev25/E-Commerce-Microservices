// src/utils/uploadToCloudinary.js
import cloudinary from '../config/cloudinary.js';

// Takes a file buffer, streams it to Cloudinary, resolves with the result.
const uploadToCloudinary = (buffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    // upload_stream returns a writable stream; we hand it our buffer.
    const stream = cloudinary.uploader.upload_stream(
      { folder }, // organizes uploads into a "products" folder in Cloudinary
      (error, result) => {
        if (error) return reject(error);
        resolve(result); // result.secure_url is the permanent https link
      }
    );
    stream.end(buffer); // send the buffer into the stream and finish
  });
};

export default uploadToCloudinary;