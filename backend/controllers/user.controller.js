import User from '../models/user.model.js';

// @desc    Get all users (scoped to org)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ orgId: req.user.orgId }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a user (scoped to admin's org)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, whatsappNumber } = req.body;
    const orgId = req.user.orgId;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (whatsappNumber) {
      const phoneExists = await User.findOne({ whatsappNumber });
      if (phoneExists) {
        return res.status(400).json({ message: 'WhatsApp number already in use' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
      whatsappNumber,
      orgId,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user by ID (scoped to org)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, orgId: req.user.orgId }).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user (scoped to org)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, orgId: req.user.orgId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, role, whatsappNumber } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.whatsappNumber = whatsappNumber || user.whatsappNumber;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      orgId: updatedUser.orgId,
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user (scoped to org)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  console.log('deleteUser called with id:', req.params.id);
  try {
    const user = await User.findOne({ _id: req.params.id, orgId: req.user.orgId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ _id: req.params.id, orgId: req.user.orgId });
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};