// src/utils/updateProductRating.js
import Review from '../models/review.model.js';
import Product from '../models/product.model.js';

// Recompute a product's averageRating and numReviews from ALL its reviews.
const updateProductRating = async (productId) => {
  // The aggregation pipeline: data flows through stages, top to bottom.
  const stats = await Review.aggregate([
    // Stage 1 — $match: keep only reviews for THIS product.
    { $match: { product: productId } },

    // Stage 2 — $group: collapse all those reviews into ONE summary row.
    {
      $group: {
        _id: '$product',                  // group key (all share the same product)
        averageRating: { $avg: '$rating' }, // $avg = average of the rating field
        numReviews: { $sum: 1 },            // $sum: 1 = count how many reviews
      },
    },
  ]);

  // aggregate() returns an array. If there are reviews, stats[0] has our numbers.
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // round to 1 decimal
      numReviews: stats[0].numReviews,
    });
  } else {
    // No reviews left (e.g. the last one was deleted) — reset to zero.
    await Product.findByIdAndUpdate(productId, { averageRating: 0, numReviews: 0 });
  }
};

export default updateProductRating;