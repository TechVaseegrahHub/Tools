import Transaction from '../models/transaction.model.js';
import Tool from '../models/tool.model.js';
import User from '../models/user.model.js';
import { resetOverdueToolStatus } from '../utils/overdueChecker.js';

// @desc    Get all transactions (scoped to org)
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const orgId = req.user.orgId;

    const transactions = await Transaction.find({ orgId })
      .populate('tool', 'toolName toolId')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const formattedTransactions = transactions.map(transaction => {
      const isCheckout = transaction.type === 'checkout';
      return {
        _id: transaction._id,
        toolName: transaction.tool?.toolName || 'Unknown Tool',
        toolId: transaction.tool?.toolId || 'Unknown ID',
        userName: transaction.user?.name || 'Unknown User',
        userEmail: transaction.user?.email || 'Unknown Email',
        action: transaction.actualReturnDate ? 'Checked In' : 'Checked Out',
        checkoutDate: isCheckout ? transaction.checkoutDate || transaction.createdAt : null,
        checkinDate: transaction.actualReturnDate || null,
        eventTimestamp: transaction.createdAt,
        dueDate: isCheckout ? transaction.expectedReturnDate : null,
        status: transaction.actualReturnDate ? 'Available' :
          (isCheckout ?
            (transaction.expectedReturnDate && new Date(transaction.expectedReturnDate) < new Date() ? 'Overdue' : 'In Use') :
            'Available')
      };
    });

    const checkoutTransactions = formattedTransactions.filter(t => t.checkoutDate);
    res.json(checkoutTransactions);
  } catch (error) {
    console.error('Error in getTransactions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a transaction (checkout) — scoped to org
// @route   POST /api/transactions/checkout
// @access  Private
export const checkoutTool = async (req, res) => {
  const { toolId, userId, expectedReturnDate, notes } = req.body;
  const orgId = req.user.orgId;

  try {
    // Verify tool exists, is available, and belongs to this org
    const tool = await Tool.findOne({ _id: toolId, orgId });
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    if (tool.status !== 'Available' && tool.status !== 'Overdue') {
      return res.status(400).json({ message: 'Tool is not available for checkout' });
    }

    // Verify user exists and belongs to this org
    const user = await User.findOne({ _id: userId, orgId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transaction = await Transaction.create({
      tool: toolId,
      user: userId,
      type: 'checkout',
      checkoutDate: new Date(),
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
      notes,
      orgId,
    });

    tool.status = 'Checked Out';
    tool.isAvailable = false;
    tool.rentedAt = new Date();
    tool.returnedAt = null;
    await tool.save();

    await transaction.populate('tool', 'toolName toolId');
    await transaction.populate('user', 'name email');

    res.status(201).json({
      _id: transaction._id,
      toolName: transaction.tool.toolName,
      toolId: transaction.tool.toolId,
      userName: transaction.user.name,
      userEmail: transaction.user.email,
      action: 'Checked Out',
      eventTimestamp: transaction.createdAt,
      dueDate: transaction.expectedReturnDate,
      status: transaction.expectedReturnDate && new Date(transaction.expectedReturnDate) < new Date() ? 'Overdue' : 'In Use'
    });
  } catch (error) {
    console.error('Error in checkoutTool:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Complete a transaction (checkin) — scoped to org
// @route   PUT /api/transactions/:id/checkin
// @access  Private
export const checkinTool = async (req, res) => {
  const { notes } = req.body || {};
  const orgId = req.user.orgId;

  try {
    console.log('Check-in request for transaction:', req.params.id);

    const checkoutTransaction = await Transaction.findOne({
      _id: req.params.id,
      type: 'checkout',
      orgId,
    });

    if (!checkoutTransaction) {
      return res.status(404).json({ message: 'Checkout transaction not found' });
    }

    if (checkoutTransaction.actualReturnDate) {
      return res.status(400).json({ message: 'Tool already checked in' });
    }

    checkoutTransaction.actualReturnDate = new Date();
    if (notes) checkoutTransaction.notes = notes;
    await checkoutTransaction.save();

    const tool = await Tool.findOne({ _id: checkoutTransaction.tool, orgId });
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    if (tool.status === 'Overdue') {
      await resetOverdueToolStatus(tool._id);
    } else {
      tool.status = 'Available';
    }
    tool.isAvailable = true;
    tool.returnedAt = new Date();
    await tool.save();

    await checkoutTransaction.populate('tool', 'toolName toolId');
    await checkoutTransaction.populate('user', 'name email');

    res.json({
      _id: checkoutTransaction._id,
      toolName: checkoutTransaction.tool?.toolName || 'Unknown',
      toolId: checkoutTransaction.tool?.toolId || 'Unknown',
      userName: checkoutTransaction.user?.name || 'Unknown',
      userEmail: checkoutTransaction.user?.email || 'Unknown',
      action: 'Checked In',
      eventTimestamp: checkoutTransaction.actualReturnDate,
      dueDate: checkoutTransaction.expectedReturnDate,
      status: 'Available'
    });
  } catch (error) {
    console.error('Error in checkinTool:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};