import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiArrowRight, FiArrowLeft, FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import TransactionModal from '../components/TransactionModal';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'Manager';

  // Helper function to ensure we always have an array
  const ensureArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    }
    console.warn('Expected array but received:', data);
    return [];
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/transactions');
        const transactionsArray = ensureArray(res.data);
        setTransactions(transactionsArray);
        setFilteredTransactions(transactionsArray);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
        toast.error('Failed to fetch transactions');
        // Set defaults to prevent errors
        setTransactions([]);
        setFilteredTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    // Filter transactions based on search term
    if (!searchTerm) {
      setFilteredTransactions(transactions);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = transactions.filter(transaction =>
        transaction.toolName?.toLowerCase().includes(term) ||
        transaction.toolId?.toLowerCase().includes(term) ||
        transaction.userName?.toLowerCase().includes(term) ||
        transaction.userEmail?.toLowerCase().includes(term) ||
        transaction.action?.toLowerCase().includes(term) ||
        transaction.status?.toLowerCase().includes(term)
      );
      setFilteredTransactions(filtered);
    }
  }, [searchTerm, transactions]);

  const handleRefresh = () => {
    // Re-fetch transactions
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/transactions');
        const transactionsArray = ensureArray(res.data);
        setTransactions(transactionsArray);
        setFilteredTransactions(transactionsArray);
        toast.info('Transactions refreshed');
      } catch (error) {
        console.error('Failed to fetch transactions', error);
        toast.error('Failed to fetch transactions');
        // Set defaults to prevent errors
        setTransactions([]);
        setFilteredTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  };

  const handleCheckIn = async (transactionId) => {
    if (!window.confirm('Are you sure you want to check in this tool?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(`/api/transactions/${transactionId}/checkin`, {});

      // Add the check-in transaction to the list
      const checkInTransaction = {
        ...response.data,
        _id: `checkin-${Date.now()}`, // Create a unique ID for the check-in
      };

      setTransactions(prev => [checkInTransaction, ...prev]);
      setFilteredTransactions(prev => [checkInTransaction, ...prev]);

      toast.success('Tool checked in successfully!');
    } catch (error) {
      console.error('Failed to check in tool', error);
      const errorMsg = error.response?.data?.message || 'Failed to check in tool';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleTransactionComplete = (newTransaction) => {
    // Add the new transaction to the list
    setTransactions(prev => [newTransaction, ...prev]);
    setFilteredTransactions(prev => [newTransaction, ...prev]);
  };

  // Format date to "Oct 23, 2025, 4:30 PM"
  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Use':
        return 'bg-green-100 text-green-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Available':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get action badge styling
  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'Checked Out':
        return 'bg-orange-100 text-orange-800';
      case 'Checked In':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transaction Log</h1>
          <p className="text-gray-600 mt-1">Track all tool check-ins and check-outs</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Refresh"
          >
            <FiRefreshCw className="h-5 w-5" />
          </button>

          {canManage && (
            <button
              onClick={handleOpenModal}
              className="btn-primary flex items-center"
            >
              <FiPlus className="mr-2" /> New Transaction
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Tool</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Checked Out</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Checked In</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                {canManage && (
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={canManage ? "7" : "6"} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                      <p className="text-gray-600">Loading transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? "7" : "6"} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <FiArrowRight className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-600">
                        {searchTerm ? 'No transactions match your search.' : 'No transactions found.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{transaction.toolName}</div>
                      <div className="text-sm text-gray-500">{transaction.toolId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{transaction.userName}</div>
                      <div className="text-sm text-gray-500">{transaction.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {transaction.checkoutDate ? (
                        <div>
                          <div className="font-medium">{formatDateTime(transaction.checkoutDate)}</div>
                        </div>
                      ) : (
                        <div className="text-gray-400">—</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {transaction.checkinDate ? (
                        <div>
                          <div className="font-medium">{formatDateTime(transaction.checkinDate)}</div>
                        </div>
                      ) : (
                        <div className="text-gray-400">—</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {transaction.dueDate ? formatDateTime(transaction.dueDate) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4">
                        {transaction.action === 'Checked Out' && transaction.status !== 'Available' && (
                          <button
                            onClick={() => handleCheckIn(transaction._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <FiArrowLeft className="mr-1 h-4 w-4" /> Check In
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionModal
          onClose={handleCloseModal}
          onTransactionComplete={handleTransactionComplete}
        />
      )}
    </div>
  );
};

export default Transactions;