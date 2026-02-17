import Transaction from '../models/transaction.model.js';
import Tool from '../models/tool.model.js';
import User from '../models/user.model.js';
import { resetOverdueToolStatus } from '../utils/overdueChecker.js';

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    // Get all transactions, sorted by date (newest first)
    const transactions = await Transaction.find()
      .populate('tool', 'toolName toolId')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Transform data for frontend consumption
    const formattedTransactions = transactions.map(transaction => {
      // Only show checkout transactions (not separate checkin records)
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

    // Filter to only show checkout transactions (each row represents one checkout, with optional checkin)
    const checkoutTransactions = formattedTransactions.filter(t => t.checkoutDate);

    res.json(checkoutTransactions);
  } catch (error) {
    console.error('Error in getTransactions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a transaction (checkout)
// @route   POST /api/transactions/checkout
// @access  Private
export const checkoutTool = async (req, res) => {
  const { toolId, userId, expectedReturnDate, notes } = req.body;

  try {
    // Verify tool exists and is available
    const tool = await Tool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    if (tool.status !== 'Available' && tool.status !== 'Overdue') {
      return res.status(400).json({ message: 'Tool is not available for checkout' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create checkout transaction
    const transaction = await Transaction.create({
      tool: toolId,
      user: userId,
      type: 'checkout',
      checkoutDate: new Date(),
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
      notes
    });

    // Update tool status to checked out
    tool.status = 'Checked Out';
    await tool.save();

    // Populate the response
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

// @desc    Complete a transaction (checkin)
// @route   PUT /api/transactions/:id/checkin
// @access  Private
export const checkinTool = async (req, res) => {
  const { notes } = req.body || {}; // Handle undefined req.body

  try {
    console.log('Check-in request for transaction:', req.params.id);

    // Find the checkout transaction
    const checkoutTransaction = await Transaction.findOne({
      _id: req.params.id,
      type: 'checkout'
    });

    if (!checkoutTransaction) {
      console.log('Checkout transaction not found');
      return res.status(404).json({ message: 'Checkout transaction not found' });
    }

    console.log('Found checkout transaction:', checkoutTransaction._id);

    // If already checked in, return error
    if (checkoutTransaction.actualReturnDate) {
      console.log('Tool already checked in');
      return res.status(400).json({ message: 'Tool already checked in' });
    }

    // Update the checkout transaction with checkin details
    checkoutTransaction.actualReturnDate = new Date();
    if (notes) {
      checkoutTransaction.notes = notes;
    }
    await checkoutTransaction.save();
    console.log('Updated checkout transaction with return date');

    // Update tool status to available
    const tool = await Tool.findById(checkoutTransaction.tool);
    if (!tool) {
      console.error('Tool not found for transaction:', checkoutTransaction.tool);
      return res.status(404).json({ message: 'Tool not found' });
    }

    console.log('Found tool:', tool.toolName, 'Status:', tool.status);

    // Update tool status
    if (tool.status === 'Overdue') {
      console.log('Resetting overdue tool status');
      await resetOverdueToolStatus(tool._id);
    } else {
      tool.status = 'Available';
      await tool.save();
      console.log('Set tool status to Available');
    }

    // Populate the response
    await checkoutTransaction.populate('tool', 'toolName toolId');
    await checkoutTransaction.populate('user', 'name email');

    console.log('Check-in completed successfully');

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
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};