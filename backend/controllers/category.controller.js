import Category from '../models/category.model.js';

// @desc    Get all categories (scoped to org)
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    
    // If superadmin, maybe they shouldn't fetch scoped categories, or just return all
    const query = req.user.orgId ? { orgId: req.user.orgId } : {};
    
    const categories = await Category.find(query).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("DEBUG CATEGORIES ERROR:", error);
    res.status(500).json({ message: 'Server Error', debug: error.message });
  }
};

// @desc    Create a new category (scoped to org)
// @route   POST /api/categories
// @access  Private/Manager
export const createCategory = async (req, res) => {
  const { name } = req.body;
  const orgId = req.user.orgId;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const categoryExists = await Category.findOne({ name, orgId });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({ name, orgId });
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};