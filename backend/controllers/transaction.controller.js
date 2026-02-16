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
      // Determine if this is a checkout or checkin transaction
      const isCheckout = transaction.type === 'checkout';
      
      // For checkin transactions, we need to find the corresponding checkout
      let checkoutTransaction = transaction;
      if (!isCheckout) {
        // This is a checkin transaction, find the original checkout
        checkoutTransaction = transactions.find(t => 
          t.tool && transaction.tool && 
          t.tool._id.toString() === transaction.tool._id.toString() &&
          t.user && transaction.user &&
          t.user._id.toString() === transaction.user._id.toString() &&
          t.type === 'checkout' &&
          t.actualReturnDate && 
          new Date(t.actualReturnDate).getTime() === transaction.createdAt.getTime()
        );
      }
      
      return {
        _id: transaction._id,
        toolName: transaction.tool?.toolName || 'Unknown Tool',
        toolId: transaction.tool?.toolId || 'Unknown ID',
        userName: transaction.user?.name || 'Unknown User',
        userEmail: transaction.user?.email || 'Unknown Email',
        action: isCheckout ? 'Checked Out' : 'Checked In',
        eventTimestamp: transaction.createdAt,
        dueDate: isCheckout ? transaction.expectedReturnDate : null,
        status: transaction.actualReturnDate ? 'Available' : 
                (isCheckout ? 
                  (transaction.expectedReturnDate && new Date(transaction.expectedReturnDate) < new Date() ? 'Overdue' : 'In Use') : 
                  'Available')
      };
    });
    
    res.json(formattedTransactions);
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
  const { notes } = req.body;

  try {
    // Find the checkout transaction
    const checkoutTransaction = await Transaction.findOne({
      _id: req.params.id,
      type: 'checkout'
    });
    
    if (!checkoutTransaction) {
      return res.status(404).json({ message: 'Checkout transaction not found' });
    }

    // If already checked in, return error
    if (checkoutTransaction.actualReturnDate) {
      return res.status(400).json({ message: 'Tool already checked in' });
    }

    // Update the checkout transaction with checkin details
    checkoutTransaction.actualReturnDate = new Date();
    checkoutTransaction.notes = notes || checkoutTransaction.notes;
    await checkoutTransaction.save();

    // Update tool status to available
    const tool = await Tool.findById(checkoutTransaction.tool);
    if (tool) {
      // If the tool was overdue, reset its status to Available
      if (tool.status === 'Overdue') {
        await resetOverdueToolStatus(tool._id);
      } else {
        tool.status = 'Available';
        await tool.save();
      }
    }

    // Populate the response
    await checkoutTransaction.populate('tool', 'toolName toolId');
    await checkoutTransaction.populate('user', 'name email');

    res.json({
      _id: checkoutTransaction._id,
      toolName: checkoutTransaction.tool.toolName,
      toolId: checkoutTransaction.tool.toolId,
      userName: checkoutTransaction.user.name,
      userEmail: checkoutTransaction.user.email,
      action: 'Checked In',
      eventTimestamp: checkoutTransaction.actualReturnDate,
      dueDate: checkoutTransaction.expectedReturnDate,
      status: 'Available'
    });
  } catch (error) {
    console.error('Error in checkinTool:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};