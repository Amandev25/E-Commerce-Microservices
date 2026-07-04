import Category from '../models/category.model.js';

// CREATE (admin) ------------------------------------------
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const category = await Category.create({ name, description }); // slug auto-fills via the hook

    return res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    // MongoDB throws this specific code when a "unique" field is duplicated.
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category already exists' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ALL (public) ----------------------------------------
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // sort A→Z
    return res.status(200).json({ success: true, results: categories.length, data: categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ONE by slug (public) --------------------------------
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE (admin) by id ------------------------------------
export const updateCategory = async (req, res) => {
  try {
    // We FIND first, then change, then .save() — on purpose (see note below).
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { name, description } = req.body;
    if (name !== undefined) category.name = name;               // changing name re-triggers the slug hook
    if (description !== undefined) category.description = description;

    await category.save(); // .save() runs pre('save'); findByIdAndUpdate would NOT

    return res.status(200).json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category name already exists' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE (admin) by id ------------------------------------
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};