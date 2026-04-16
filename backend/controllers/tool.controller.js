import Tool from '../models/tool.model.js';
import Category from '../models/category.model.js';
import Organization from '../models/organization.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { getPlanDetails } from '../utils/subscriptionPlans.js';

// ─── In-memory cache ───────────────────────────────────────────────
// Caches tool query results for 60s to avoid repeated Atlas round-trips.
// Cache is keyed by orgId to keep tenants isolated.
const toolCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

const getCacheKey = (orgId, search, page, limit, category) => `${orgId}|${search}|${page}|${limit}|${category || 'ALL'}`;

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

// @desc    Get tools with pagination, search, category filter, and in-memory cache (scoped to org)
// @route   GET /api/tools?page=1&limit=8&search=keyword&category=id
// @access  Private
export const getTools = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const keyword = req.query.search ? req.query.search.trim() : '';
    const category = req.query.category && req.query.category !== 'ALL' ? req.query.category : null;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 8));
    const skip = (page - 1) * limit;

    const cacheKey = getCacheKey(orgId, keyword, page, limit, category);
    console.log("AAYUDHA GETTOOLS QUERY:", { orgId, keyword, category, page, limit, cacheKey });

    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('Cache HIT:', cacheKey, "returned", cached.tools.length, "tools");
      return res.json(cached);
    }
    console.log('Cache MISS:', cacheKey);

    let query = { orgId };
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = new mongoose.Types.ObjectId(category);
      } else {
        query.category = null;
      }
    }
    if (keyword) {
      query.$or = [
        { toolName: { $regex: keyword, $options: 'i' } },
        { toolId: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    console.log("AAYUDHA MONGOOSE QUERY OBJECT:", JSON.stringify(query));

    const [totalCount, tools] = await Promise.all([
      Tool.countDocuments(query),
      Tool.find(query)
        .populate('category', 'name')
        .populate('ownerId', 'name email')
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    const result = { tools, totalCount, totalPages: Math.ceil(totalCount / limit), currentPage: page, limit };
    console.log("AAYUDHA RESULTS COUNT:", result.tools.length);
    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error in getTools:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all rentable tools globally for marketplace
// @route   GET /api/tools/marketplace?search=keyword&category=id&sort=price_asc&availableOnly=true
// @access  Private
export const getMarketplaceTools = async (req, res) => {
  try {
    // Definitive log to verify the function is called
    try {
        import('fs').then(fs => {
            fs.appendFileSync('marketplace_trace.log', `[${new Date().toISOString()}] HIT - search: "${req.query.search}"\n`);
        });
    } catch(e) {}

    const {
      search = "",
      category,
      sort = "newest",
      availableOnly = "false",
    } = req.query;

    console.log("MARKETPLACE_QUERY_ENTER:", { search, category, sort, availableOnly });

    // Baseline filter
    let filter = { isRentable: true };

    // Only apply category filter if it's a valid ID and not "ALL"
    if (category && category !== "ALL" && mongoose.isValidObjectId(category)) {
      filter.category = category;
    }

    if (availableOnly === "true") {
      filter.status = "Available";
    }

    if (search && search.trim()) {
      // Escape special characters to prevent invalid regex errors
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = { $regex: escapedSearch, $options: "i" };
      filter.$or = [
        { toolName: searchRegex },
        { description: searchRegex }
      ];
    }

    console.log("MARKETPLACE_FILTER_APPLIED:", JSON.stringify(filter));

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "price_low") sortOption = { price_per_hour: 1 };
    if (sort === "price_high") sortOption = { price_per_hour: -1 };

    // Enhanced Sorting: Join with Organization to get visibility levels
    // Priority: Highlighted (Pro) > Priority (Basic) > Normal (Free)
    const tools = await Tool.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'organizations',
          localField: 'orgId',
          foreignField: '_id',
          as: 'org'
        }
      },
      { $unwind: '$org' },
      {
        $addFields: {
          visibilityWeight: {
            $switch: {
              branches: [
                { case: { $eq: ['$org.subscriptionPlan', 'Pro'] }, then: 3 },
                { case: { $eq: ['$org.subscriptionPlan', 'Basic'] }, then: 2 },
              ],
              default: 1
            }
          }
        }
      },
      { $sort: { visibilityWeight: -1, ...sortOption } }
    ]);

    // Manually populate category and owner since aggregate doesn't use standard populate
    const toolsPopulated = await Tool.populate(tools, [
      { path: 'category', select: 'name' },
      { path: 'ownerId', select: 'name email' }
    ]);

    console.log("MARKETPLACE_ROWS_FOUND:", toolsPopulated.length);

    return res.status(200).json({
      success: true,
      data: toolsPopulated,
      count: toolsPopulated.length
    });
  } catch (error) {
    console.error("CRITICAL_MARKETPLACE_FAILURE:", error);
    return res.status(500).json({
      success: false,
      code: "MARKETPLACE_API_ERROR",
      message: "Internal Marketplace Error",
      error: error.message,
      stack: error.stack
    });
  }
};


// @desc    Create a tool (scoped to org)
// @route   POST /api/tools
// @access  Private/Manager
export const createTool = async (req, res) => {
  console.log('createTool called with body:', req.body);
  const { 
    toolName, toolId, category, status, purchaseDate, location, image,
    description, price_per_hour, isRentable 
  } = req.body;
  const orgId = req.user.orgId;
  const ownerId = req.user.id;

  try {
    // 1. Enforce Tool Limit based on Subscription Plan
    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const plan = getPlanDetails(org.subscriptionPlan);
    const toolCount = await Tool.countDocuments({ orgId });

    if (org.subscriptionStatus !== 'active' && org.subscriptionPlan !== 'Free') {
        // Handle expired non-free plans (should probably revert to Free limits)
        if (toolCount >= getPlanDetails('Free').toolLimit) {
            return res.status(403).json({
                code: 'SUBSCRIPTION_EXPIRED',
                message: 'Your subscription has expired. Please renew or upgrade to continue adding tools.'
            });
        }
    }

    if (toolCount >= plan.toolLimit) {
        return res.status(403).json({
            code: 'TOOL_LIMIT_REACHED',
            message: `Your current ${plan.name} plan limit of ${plan.toolLimit} tools has been reached. Please upgrade to list more tools.`
        });
    }

    // Check if tool ID already exists within this org
    const toolExists = await Tool.findOne({ toolId, orgId });
    if (toolExists) {
      return res.status(400).json({ message: 'Tool ID already exists' });
    }

    // Check if category exists (and belongs to this org)
    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: 'A valid category is required' });
    }

    const categoryExists = await Category.findOne({ _id: category, orgId });
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found or does not belong to your organization' });
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
      description: description || '',
      price_per_hour: price_per_hour || 0,
      isRentable: isRentable || false,
      ownerId,
      orgId,
    });

    // Populate category name and owner for response
    const populatedTool = await Tool.findById(tool._id)
      .populate('category', 'name')
      .populate('ownerId', 'name email');

    invalidateToolCache(orgId);
    res.status(201).json({
      success: true,
      data: populatedTool
    });
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
  const { id } = req.params;
  const orgId = req.user.orgId;

  console.log(`[${new Date().toISOString()}] UPDATE_TOOL_REQUEST:`, { 
    id, 
    orgId, 
    body: req.body 
  });

  try {
    // 1. Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid tool ID format' 
      });
    }

    // 2. Destructure and validate required fields
    const { 
      toolName, 
      toolId, 
      category, 
      status, 
      purchaseDate, 
      location, 
      image,
      description, 
      price_per_hour, 
      isRentable 
    } = req.body;

    // Check required fields (logic: name and category are essential for tool existence)
    if (!toolName) return res.status(400).json({ success: false, message: 'Tool Name is required' });
    if (!category) return res.status(400).json({ success: false, message: 'Category is required' });

    // 3. Prepare Update Object
    const updateData = {};
    if (toolName !== undefined) updateData.toolName = toolName;
    if (toolId !== undefined) updateData.toolId = toolId;
    if (category !== undefined) {
       if (!mongoose.Types.ObjectId.isValid(category)) {
         return res.status(400).json({ success: false, message: 'Invalid category ID' });
       }
       // Ensure category belongs to this org
       const categoryExists = await Category.findOne({ _id: category, orgId });
       if (!categoryExists) {
         return res.status(400).json({ success: false, message: 'Category not found or access denied' });
       }
       updateData.category = category;
    }
    if (status !== undefined) updateData.status = status;
    if (location !== undefined) updateData.location = location;
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (isRentable !== undefined) updateData.isRentable = isRentable;
    
    // Purchase Date handling
    if (purchaseDate !== undefined) {
      updateData.purchaseDate = purchaseDate ? new Date(purchaseDate) : null;
    }

    // Price handling (ensure number)
    if (price_per_hour !== undefined) {
      const price = parseFloat(price_per_hour);
      if (isNaN(price)) {
        return res.status(400).json({ success: false, message: 'Price per hour must be a valid number' });
      }
      updateData.price_per_hour = price;
    }

    // 4. Check for toolId conflict (if toolId is being changed)
    if (toolId) {
      const existingTool = await Tool.findOne({ toolId, orgId, _id: { $ne: id } });
      if (existingTool) {
        return res.status(400).json({ success: false, message: 'Tool ID / Serial Number already in use by another tool' });
      }
    }

    // 5. Execute Update (Scoped to Org)
    const updatedTool = await Tool.findOneAndUpdate(
      { _id: id, orgId }, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    ).populate('category', 'name').populate('ownerId', 'name email');

    if (!updatedTool) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tool not found or you do not have permission to edit it' 
      });
    }

    console.log(`[${new Date().toISOString()}] UPDATE_TOOL_SUCCESS:`, updatedTool._id);
    invalidateToolCache(orgId);
    
    return res.status(200).json({
      success: true,
      data: updatedTool
    });

  } catch (error) {
    console.error('CRITICAL ERROR in updateTool:', {
      error: error.message,
      stack: error.stack,
      id,
      body: req.body
    });

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: 'Validation Error', details: messages });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: `Invalid value for ${error.path}` });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
};

// @desc    Mark tool as returned (quick return)
// @route   PATCH /api/tools/:id/return
// @access  Private/Manager
export const returnTool = async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  console.log(`[RETURN_DEBUG] Start - ID: ${id}, Org: ${orgId}`);

  try {
    // 1. Database connection check
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    // 2. Find Tool
    console.log(`[RETURN_DEBUG] Searching for tool...`);
    const tool = await Tool.findOne({ _id: id, orgId });

    if (!tool) {
      console.log(`[RETURN_DEBUG] Tool not found`);
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }
    console.log(`[RETURN_DEBUG] Tool found: ${tool.toolName}, Current Status: ${tool.status}`);

    // 3. Mark as returned
    console.log(`[RETURN_DEBUG] Updating status...`);
    tool.status = 'Available';
    tool.isAvailable = true;
    tool.returnedAt = new Date();

    console.log(`[RETURN_DEBUG] Saving tool...`);
    const savedTool = await tool.save();
    console.log(`[RETURN_DEBUG] Save successful: ${savedTool._id}`);

    invalidateToolCache(orgId);

    return res.json({
      success: true,
      data: savedTool,
      message: 'Tool returned successfully'
    });
  } catch (error) {
    console.error('[RETURN_DEBUG] CRITICAL FAILURE:', {
      message: error.message,
      name: error.name,
      id,
      stack: error.stack
    });
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server Error during return', 
      error: error.message 
    });
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