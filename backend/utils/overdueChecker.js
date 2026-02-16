import Tool from '../models/tool.model.js';
import Transaction from '../models/transaction.model.js';

/**
 * Check for overdue tools and update their status
 * This function should be called periodically (e.g., daily)
 */
export const checkOverdueTools = async () => {
  try {
    console.log('Checking for overdue tools...');
    
    // Find tools that are checked out and have an expected return date in the past
    const overdueTransactions = await Transaction.find({
      type: 'checkout',
      actualReturnDate: null, // Not yet returned
      expectedReturnDate: { $lt: new Date() } // Expected return date is in the past
    }).populate('tool');
    
    let updatedCount = 0;
    
    // Update the status of overdue tools
    for (const transaction of overdueTransactions) {
      const tool = transaction.tool;
      if (tool && tool.status !== 'Overdue') {
        tool.status = 'Overdue';
        await tool.save();
        updatedCount++;
        console.log(`Marked tool ${tool.toolName} (${tool.toolId}) as Overdue`);
      }
    }
    
    console.log(`Overdue check completed. ${updatedCount} tools marked as overdue.`);
    return { success: true, updatedCount };
  } catch (error) {
    console.error('Error checking for overdue tools:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Reset tool status from Overdue to Available when checked in
 * This is called when a tool is checked in
 */
export const resetOverdueToolStatus = async (toolId) => {
  try {
    const tool = await Tool.findById(toolId);
    if (tool && tool.status === 'Overdue') {
      tool.status = 'Available';
      await tool.save();
      console.log(`Reset tool ${tool.toolName} (${tool.toolId}) status from Overdue to Available`);
      return { success: true };
    }
    return { success: false, message: 'Tool not found or not overdue' };
  } catch (error) {
    console.error('Error resetting overdue tool status:', error);
    return { success: false, error: error.message };
  }
};