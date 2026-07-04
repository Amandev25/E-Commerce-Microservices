import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

// Small helper: calculate the total from the items (never stored).
const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);

// GET my cart ---------------------------------------------
export const getCart = async (req, res) => {
  try {
    // req.user.id comes from the authenticate middleware.
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name slug images price'); // show product details for each item

    // No cart yet? Treat it as an empty cart rather than a 404 — nicer for the frontend.
    if (!cart) {
      return res.status(200).json({ success: true, data: { items: [], total: 0 } });
    }

    return res.status(200).json({
      success: true,
      data: { items: cart.items, total: calculateTotal(cart.items) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ADD an item (or increase its quantity) ------------------
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    // Validate input
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }
    if (qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    // Look up the REAL product server-side — this is where price comes from.
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Optional but sensible: don't allow adding more than is in stock.
    if (product.stock < qty) {
      return res.status(400).json({ success: false, message: 'Not enough stock' });
    }

    // Find the user's cart, or create a fresh one.
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Is this product already in the cart? If so, bump quantity; else add a new line.
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty,
        priceSnapshot: product.price, // 👈 THE SNAPSHOT — price taken from the DB, not the request
      });
    }

    await cart.save();
    return res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: { items: cart.items, total: calculateTotal(cart.items) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE one item's quantity (set, not add) ---------------
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    item.quantity = qty; // set it directly
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: { items: cart.items, total: calculateTotal(cart.items) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// REMOVE one item -----------------------------------------
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Keep every item EXCEPT the one we're removing.
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Item removed',
      data: { items: cart.items, total: calculateTotal(cart.items) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CLEAR the whole cart ------------------------------------
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.status(200).json({ success: true, message: 'Cart cleared', data: { items: [], total: 0 } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};