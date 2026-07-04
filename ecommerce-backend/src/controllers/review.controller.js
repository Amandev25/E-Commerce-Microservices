import Review from '../models/review.model.js';
import Product from '../models/product.model.js';
import updateProductRating from '../utils/updateProductRating.js';

// GET a product's reviews (public) ------------------------
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')      // show reviewer's name (populate to FETCH it)
      .sort({ createdAt: -1 });      // newest first
    return res.status(200).json({ success: true, results: reviews.length, data: reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CREATE a review (user) ----------------------------------
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, message: 'Rating is required' });
    }

    // Make sure the product exists before reviewing it.
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = await Review.create({
      user: req.user._id,    // who: from the token, never from the body
      product: productId,
      rating,
      comment,
    });

    // Recompute the product's rating now that a review was added.
    await updateProductRating(product._id);

    return res.status(201).json({ success: true, message: 'Review added', data: review });
  } catch (error) {
    // Compound unique index fires this if they already reviewed this product.
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You already reviewed this product' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE your own review ----------------------------------
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // OWNERSHIP CHECK: only the author can edit. Compare ids as strings.
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own review' });
    }

    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    // Rating may have changed → recompute the product's average.
    await updateProductRating(review.product);

    return res.status(200).json({ success: true, message: 'Review updated', data: review });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE a review (owner OR admin) ------------------------
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Allowed if you're the author OR an admin.
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdminUser = req.user.role === 'admin';
    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this review' });
    }

    const productId = review.product; // remember before deleting
    await review.deleteOne();

    // Recompute (this handles the "last review deleted → reset to 0" case).
    await updateProductRating(productId);

    return res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};