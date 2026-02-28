import Tool from '../models/tool.model.js';
import Category from '../models/category.model.js';

// ─── In-memory cache ───────────────────────────────────────────────
// Caches tool query results for 60s to avoid repeated Atlas round-trips.
// Cache is keyed by orgId to keep tenants isolated.
const toolCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

const getCacheKey = (orgId, search, page, limit) => `${orgId}|${search}|${page}|${limit}`;

const getFromCache = (key) => {
  const entry = toolCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) { toolCache.delete(key); return null; }
  return entry.data;
};

const setCache = (key, data) => toolCache.set(key, { data, timestamp: Date.now() });

export const invalidateToolCache = (orgId) => {
  if (orgId) {
    // Only clear cache entries for this org
    for (const key of toolCache.keys()) {
      if (key.startsWith(`${orgId}|`)) toolCache.delete(key);
    }
  } else {
    toolCache.clear();
  }
  console.log('Tool cache cleared for org:', orgId || 'ALL');
};
// ───────────────────────────────────────────────────────────────────

// @desc    Get tools with pagination, search, and in-memory cache (scoped to org)
// @route   GET /api/tools?page=1&limit=8&search=keyword
// @access  Private
export const getTools = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const keyword = req.query.search ? req.query.search.trim() : '';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 8));
    const skip = (page - 1) * limit;

    const cacheKey = getCacheKey(orgId, keyword, page, limit);
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('Cache HIT:', cacheKey);
      return res.json(cached);
    }
    console.log('Cache MISS:', cacheKey);

    let query = { orgId };
    if (keyword) {
      query.$or = [
        { toolName: { $regex: keyword, $options: 'i' } },
        { toolId: { $regex: keyword, $options: 'i' } }
      ];
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


// @desc    Create a tool (scoped to org)
// @route   POST /api/tools
// @access  Private/Manager
export const createTool = async (req, res) => {
  console.log('createTool called with body:', req.body);
  const { toolName, toolId, category, status, purchaseDate, location, image } = req.body;
  const orgId = req.user.orgId;

  try {
    // Check if tool ID already exists within this org
    const toolExists = await Tool.findOne({ toolId, orgId });
    if (toolExists) {
      return res.status(400).json({ message: 'Tool ID already exists' });
    }

    // Check if category exists (and belongs to this org)
    const categoryExists = await Category.findOne({ _id: category, orgId });
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Create new tool scoped to org
    const tool = await Tool.create({
      toolName,
      toolId,
      category,
      status: status || 'Available',
      purchaseDate: purchaseDate || null,
      location: location || '',
      image: image || '',
      orgId,
    });

    // Populate category name for response
    const populatedTool = await Tool.findById(tool._id).populate('category', 'name');

    invalidateToolCache(orgId);
    res.status(201).json(populatedTool);
  } catch (error) {
    console.error('Error in createTool:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get tool by ID (scoped to org)
// @route   GET /api/tools/:id
// @access  Private
export const getToolById = async (req, res) => {
  console.log('getToolById called with id:', req.params.id);
  try {
    const tool = await Tool.findOne({ _id: req.params.id, orgId: req.user.orgId }).populate('category', 'name');
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

// @desc    Update tool (scoped to org)
// @route   PUT /api/tools/:id
// @access  Private/Manager
export const updateTool = async (req, res) => {
  console.log('updateTool called with id:', req.params.id, 'and body:', req.body);
  const { toolName, toolId, category, status, purchaseDate, location, image } = req.body;
  const orgId = req.user.orgId;

  try {
    const tool = await Tool.findOne({ _id: req.params.id, orgId });

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    // Check if new toolId conflicts with another tool in the same org
    if (toolId && toolId !== tool.toolId) {
      const toolExists = await Tool.findOne({ toolId, orgId });
      if (toolExists) {
        return res.status(400).json({ message: 'Tool ID already in use' });
      }
    }

    // Check if category exists within this org
    if (category) {
      const categoryExists = await Category.findOne({ _id: category, orgId });
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

    invalidateToolCache(orgId);
    res.json(populatedTool);
  } catch (error) {
    console.error('Error in updateTool:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete tool (scoped to org)
// @route   DELETE /api/tools/:id
// @access  Private/Admin
export const deleteTool = async (req, res) => {
  console.log('deleteTool called with id:', req.params.id);
  const orgId = req.user.orgId;
  try {
    const tool = await Tool.findOne({ _id: req.params.id, orgId });

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    await Tool.deleteOne({ _id: req.params.id, orgId });
    invalidateToolCache(orgId);
    res.json({ message: 'Tool removed' });
  } catch (error) {
    console.error('Error in deleteTool:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};