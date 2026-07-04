import Wishlist from '../models/wishlist.model.js';
import Product from '../models/product.model.js';

// GET my wishlist -----------------------------------------
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'name slug price images averageRating');

    // No wishlist yet → return an empty one rather than 404.
    if (!wishlist) {
      return res.status(200).json({ success: true, data: { products: [] } });
    }
    return res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// TOGGLE a product (add if missing, remove if present) ----
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Make sure the product is real before saving it.
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Find the user's wishlist, or create an empty one.
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Is the product already in the list? (compare ids as strings)
    const exists = wishlist.products.some((id) => id.toString() === productId);

    let message;
    if (exists) {
      // Remove it — keep everything except this id.
      wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
      message = 'Removed from wishlist';
    } else {
      // Add it.
      wishlist.products.push(productId);
      message = 'Added to wishlist';
    }

    await wishlist.save();
    return res.status(200).json({ success: true, message, data: wishlist.products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// REMOVE one product explicitly ---------------------------
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    return res.status(200).json({ success: true, message: 'Removed from wishlist', data: wishlist.products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CLEAR the whole wishlist --------------------------------
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }
    return res.status(200).json({ success: true, message: 'Wishlist cleared', data: { products: [] } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};