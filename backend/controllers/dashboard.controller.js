import Tool from '../models/tool.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

// @desc    Get dashboard statistics (scoped to org)
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const orgId = req.user.orgId;

    const [totalTools, toolsAvailable, toolsCheckedOut, toolsOverdue, totalUsers, recentTransactions] =
      await Promise.all([
        Tool.countDocuments({ orgId }),
        Tool.countDocuments({ orgId, status: 'Available' }),
        Tool.countDocuments({ orgId, status: 'Checked Out' }),
        Tool.countDocuments({ orgId, status: 'Overdue' }),
        User.countDocuments({ orgId }),
        Transaction.countDocuments({ orgId }),
      ]);

    res.json({
      totalTools,
      toolsAvailable,
      toolsCheckedOut,
      toolsOverdue,
      totalUsers,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get overdue tools (scoped to org)
// @route   GET /api/dashboard/overdue
export const getOverdueTools = async (req, res) => {
  try {
    const overdueTools = await Tool.find({ orgId: req.user.orgId, status: 'Overdue' })
      .sort({ _id: -1 })
      .limit(10);
    res.json(overdueTools);
  } catch (error) {
    console.error('Error in getOverdueTools:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get recent activity (scoped to org)
// @route   GET /api/dashboard/recent
export const getRecentActivity = async (req, res) => {
  try {
    const recentTransactions = await Transaction.find({ orgId: req.user.orgId })
      .populate('tool', 'toolName')
      .populate('user', 'name')
      .sort({ _id: -1 })
      .limit(10);

    const recentActivity = recentTransactions.map(transaction => ({
      action: transaction.type === 'checkout' ? 'Tool Checked Out' : 'Tool Returned',
      description: `${transaction.user?.name || 'Unknown User'} ${transaction.type === 'checkout' ? 'checked out' : 'returned'} ${transaction.tool?.toolName || 'Unknown Tool'}`,
      time: transaction.createdAt,
    }));

    res.json(recentActivity);
  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};