import Product from '../models/product.model.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
// CREATE (admin) ------------------------------------------
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, images, category } = req.body;

    // Plan: what must be true? The required fields are present.
    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price and category are required',
      });
    }

    const product = await Product.create({ name, description, price, stock, images, category });
    return res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ONE by id (public) ----------------------------------
export const getProduct = async (req, res) => {
  try {
    // populate('category') follows the pointer and swaps the id for the real
    // category object — but we only pull its name and slug, not the whole thing.
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE (admin) ------------------------------------------
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Only overwrite the fields that were actually sent.
    const fields = ['name', 'description', 'price', 'stock', 'images', 'category'];
    for (const field of fields) {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    }

    await product.save(); // .save() so the slug hook runs if name changed
    return res.status(200).json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE (admin) ------------------------------------------
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ALL (public) — search + filter + sort + pagination
export const getProducts = async (req, res) => {
  try {
    // Pull every optional knob out of the query string.
    const { keyword, category, minPrice, maxPrice, sort } = req.query;

    // --- Build the filter object piece by piece ---
    // Start empty, then ADD a condition only if that param was provided.
    const filter = {};

    // Search by name, case-insensitive. 'i' = ignore case.
    if (keyword) {
      filter.name = { $regex: keyword, $options: 'i' };
    }

    // Filter by category id.
    if (category) {
      filter.category = category;
    }

    // Price range. $gte = greater-than-or-equal, $lte = less-than-or-equal.
    // We build the price object only if at least one bound was sent.
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // --- Pagination ---
    const page = Number(req.query.page) || 1;     // default to page 1
    const limit = Number(req.query.limit) || 10;  // default 10 per page
    const skip = (page - 1) * limit;              // how many to jump over

    // --- Sorting ---
    // Let the client pass e.g. ?sort=price or ?sort=-price (the - means descending).
    // Default: newest first.
    const sortBy = sort || '-createdAt';

    // --- Run the query ---
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Total count (ignoring pagination) so the client can show "page X of Y".
    const total = await Product.countDocuments(filter);

    return res.status(200).json({
      success: true,
      results: products.length,
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      data: products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const uploadProductImages = async (req, res) => {
  try {
    // 1. Check the product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 2. Check files actually came through (Multer puts them on req.files)
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    // 3. Upload each file to Cloudinary, collecting the returned URLs.
    //    Promise.all runs all uploads in parallel instead of one-by-one.
    const uploadResults = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, 'products'))
    );
    const imageUrls = uploadResults.map((result) => result.secure_url);

    // 4. Add the new URLs to the product's images array and save.
    product.images.push(...imageUrls);
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Images uploaded',
      data: product.images,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Image upload failed' });
  }
};