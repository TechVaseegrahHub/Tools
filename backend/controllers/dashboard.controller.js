import Tool from '../models/tool.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalTools = await Tool.countDocuments();
    const toolsAvailable = await Tool.countDocuments({ status: 'Available' });
    const toolsCheckedOut = await Tool.countDocuments({ status: 'Checked Out' });
    const toolsOverdue = await Tool.countDocuments({ status: 'Overdue' }); // You might need to adjust this based on your logic
    const totalUsers = await User.countDocuments();
    const recentTransactions = await Transaction.countDocuments();

    res.json({
      totalTools,
      toolsAvailable,
      toolsCheckedOut,
      toolsOverdue,
      totalUsers,
      recentTransactions
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get overdue tools
// @route   GET /api/dashboard/overdue
export const getOverdueTools = async (req, res) => {
  try {
    // This is a simplified version - you might need to adjust based on your actual logic for determining overdue tools
    const overdueTools = await Tool.find({ status: 'Overdue' }).limit(10);
    
    res.json(overdueTools);
  } catch (error) {
    console.error('Error in getOverdueTools:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/recent
export const getRecentActivity = async (req, res) => {
  try {
    // This is a simplified version - you might want to implement a more sophisticated activity tracking system
    const recentTransactions = await Transaction.find()
      .populate('tool', 'toolName')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const recentActivity = recentTransactions.map(transaction => ({
      action: transaction.type === 'checkout' ? 'Tool Checked Out' : 'Tool Returned',
      description: `${transaction.user.name} ${transaction.type === 'checkout' ? 'checked out' : 'returned'} ${transaction.tool.toolName}`,
      time: transaction.createdAt
    }));
    
    res.json(recentActivity);
  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};