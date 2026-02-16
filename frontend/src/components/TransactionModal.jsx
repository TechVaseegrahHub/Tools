import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiUser, FiTool, FiCalendar, FiSave, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const TransactionModal = ({ onClose, onTransactionComplete }) => {
  const [users, setUsers] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    toolId: '',
    expectedReturnDate: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Fetch users and tools when modal opens
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, toolsRes] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/tools')
        ]);
        
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        // Filter only available tools
        const availableTools = Array.isArray(toolsRes.data) 
          ? toolsRes.data.filter(tool => tool.status === 'Available') 
          : [];
        setTools(availableTools);
      } catch (error) {
        console.error('Failed to fetch data', error);
        toast.error('Failed to load data for transaction');
        setUsers([]);
        setTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.userId) {
      newErrors.userId = 'Please select a user';
    }
    
    if (!formData.toolId) {
      newErrors.toolId = 'Please select a tool';
    }
    
    if (!formData.expectedReturnDate) {
      newErrors.expectedReturnDate = 'Please set a due date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post('/api/transactions/checkout', formData);
      
      toast.success('Tool checked out successfully!');
      onTransactionComplete(response.data);
      onClose();
    } catch (error) {
      console.error('Failed to checkout tool', error);
      const errorMsg = error.response?.data?.message || 'Failed to checkout tool';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Modal Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {/* Modal Container */ }
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-lg mr-3">
              <FiTool className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">New Transaction - Check Out Tool</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Selection */ }
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiUser className="mr-2 h-4 w-4" /> Select User *
                </label>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  className={`input-field ${errors.userId ? 'border-red-500' : ''}`}
                  disabled={loading}
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.userId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.userId}
                  </p>
                )}
              </div>
              
              {/* Tool Selection */ }
              <div>
                <label htmlFor="toolId" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiTool className="mr-2 h-4 w-4" /> Select Tool *
                </label>
                <select
                  id="toolId"
                  name="toolId"
                  value={formData.toolId}
                  onChange={handleChange}
                  required
                  className={`input-field ${errors.toolId ? 'border-red-500' : ''}`}
                  disabled={loading}
                >
                  <option value="">Select an available tool</option>
                  {tools.map((tool) => (
                    <option key={tool._id} value={tool._id}>
                      {tool.toolName} ({tool.toolId})
                    </option>
                  ))}
                </select>
                {errors.toolId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.toolId}
                  </p>
                )}
              </div>
            </div>

            {/* Due Date */ }
            <div>
              <label htmlFor="expectedReturnDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiCalendar className="mr-2 h-4 w-4" /> Due Date *
              </label>
              <input
                type="date"
                id="expectedReturnDate"
                name="expectedReturnDate"
                value={formData.expectedReturnDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]} // Today or future dates only
                className={`input-field ${errors.expectedReturnDate ? 'border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.expectedReturnDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.expectedReturnDate}
                </p>
              )}
            </div>

            {/* Notes */ }
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes about this transaction..."
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* Form Actions */ }
            <div className="flex justify-end pt-4 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Check Out Tool
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;