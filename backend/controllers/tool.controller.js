import Tool from '../models/tool.model.js';
import Category from '../models/category.model.js';

// ─── In-memory cache ───────────────────────────────────────────────
// Caches tool query results for 60s to avoid repeated Atlas round-trips.
const toolCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

const getCacheKey = (search, page, limit) => `${search}|${page}|${limit}`;

const getFromCache = (key) => {
  const entry = toolCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) { toolCache.delete(key); return null; }
  return entry.data;
};

const setCache = (key, data) => toolCache.set(key, { data, timestamp: Date.now() });

export const invalidateToolCache = () => { toolCache.clear(); console.log('Tool cache cleared'); };
// ───────────────────────────────────────────────────────────────────

// @desc    Get tools with pagination, search, and in-memory cache
// @route   GET /api/tools?page=1&limit=8&search=keyword
// @access  Private
export const getTools = async (req, res) => {
  try {
    const keyword = req.query.search ? req.query.search.trim() : '';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 8));
    const skip = (page - 1) * limit;

    const cacheKey = getCacheKey(keyword, page, limit);
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('Cache HIT:', cacheKey);
      return res.json(cached);
    }
    console.log('Cache MISS:', cacheKey);

    let query = {};
    if (keyword) {
      query = {
        $or: [
          { toolName: { $regex: keyword, $options: 'i' } },
          { toolId: { $regex: keyword, $options: 'i' } }
        ]
      };
    }

    const [totalCount, tools] = await Promise.all([
      Tool.countDocuments(query),
      Tool.find(query).populate('category', 'name').sort({ _id: -1 }).skip(skip).limit(limit)
    ]);

    const result = { tools, totalCount, totalPages: Math.ceil(totalCount / limit), currentPage: page, limit };
    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error in getTools:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Create a tool
// @route   POST /api/tools
// @access  Private/Manager
export const createTool = async (req, res) => {
  console.log('createTool called with body:', req.body);
  const { toolName, toolId, category, status, purchaseDate, location, image } = req.body;

  try {
    // Check if tool ID already exists
    const toolExists = await Tool.findOne({ toolId });
    if (toolExists) {
      return res.status(400).json({ message: 'Tool ID already exists' });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Create new tool
    const tool = await Tool.create({
      toolName,
      toolId,
      category,
      status: status || 'Available',
      purchaseDate: purchaseDate || null,
      location: location || '',
      image: image || ''
    });

    // Populate category name for response
    const populatedTool = await Tool.findById(tool._id).populate('category', 'name');

    invalidateToolCache(); // Clear cache so next fetch reflects the new tool
    res.status(201).json(populatedTool);
  } catch (error) {
    console.error('Error in createTool:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get tool by ID
// @route   GET /api/tools/:id
// @access  Private
export const getToolById = async (req, res) => {
  console.log('getToolById called with id:', req.params.id);
  try {
    const tool = await Tool.findById(req.params.id).populate('category', 'name');
    if (tool) {
      res.json(tool);
    } else {
      res.status(404).json({ message: 'Tool not found' });
    }
  } catch (error) {
    console.error('Error in getToolById:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update tool
// @route   PUT /api/tools/:id
// @access  Private/Manager
export const updateTool = async (req, res) => {
  console.log('updateTool called with id:', req.params.id, 'and body:', req.body);
  const { toolName, toolId, category, status, purchaseDate, location, image } = req.body;

  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    // Check if new toolId conflicts with another tool (except the current one)
    if (toolId && toolId !== tool.toolId) {
      const toolExists = await Tool.findOne({ toolId });
      if (toolExists) {
        return res.status(400).json({ message: 'Tool ID already in use' });
      }
    }

    // Check if category exists (if provided)
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    // Update tool
    tool.toolName = toolName || tool.toolName;
    tool.toolId = toolId || tool.toolId;
    tool.category = category || tool.category;
    tool.status = status || tool.status;
    tool.purchaseDate = purchaseDate !== undefined ? purchaseDate : tool.purchaseDate;
    tool.location = location || tool.location;
    tool.image = image !== undefined ? image : tool.image;

    const updatedTool = await tool.save();

    // Populate category name for response
    const populatedTool = await Tool.findById(updatedTool._id).populate('category', 'name');

    invalidateToolCache(); // Clear cache so next fetch reflects the update
    res.json(populatedTool);
  } catch (error) {
    console.error('Error in updateTool:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete tool
// @route   DELETE /api/tools/:id
// @access  Private/Admin
export const deleteTool = async (req, res) => {
  console.log('deleteTool called with id:', req.params.id);
  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    // Remove tool using deleteOne() instead of remove()
    await Tool.deleteOne({ _id: req.params.id });
    invalidateToolCache(); // Clear cache so next fetch reflects the deletion
    res.json({ message: 'Tool removed' });
  } catch (error) {
    console.error('Error in deleteTool:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};