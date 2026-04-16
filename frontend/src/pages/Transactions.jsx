import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiArrowRight, FiArrowLeft, FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToCheckIn, setTransactionToCheckIn] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

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

  const handleCheckIn = (transaction) => {
    setTransactionToCheckIn(transaction);
  };

  const confirmCheckIn = async () => {
    if (!transactionToCheckIn) return;
    setIsCheckingIn(true);

    try {
      const response = await axios.put(`/api/transactions/${transactionToCheckIn._id}/checkin`, {});

      // Update the existing row in-place — fill in checkinDate and flip status
      const updatedRow = {
        ...transactionToCheckIn,
        checkinDate: response.data.eventTimestamp || new Date().toISOString(),
        status: 'Available',
        action: 'Returned',
      };

      setTransactions(prev => prev.map(t => t._id === transactionToCheckIn._id ? updatedRow : t));
      setFilteredTransactions(prev => prev.map(t => t._id === transactionToCheckIn._id ? updatedRow : t));

      toast.success('Tool returned successfully!');
      setTransactionToCheckIn(null);
    } catch (error) {
      console.error('Failed to check in tool', error);
      const errorMsg = error.response?.data?.message || 'Failed to check in tool';
      toast.error(errorMsg);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleTransactionComplete = (newTransaction) => {
    // Map eventTimestamp → checkoutDate so the Checked Out column shows correctly
    const mapped = {
      ...newTransaction,
      checkoutDate: newTransaction.checkoutDate || newTransaction.eventTimestamp,
    };
    setTransactions(prev => [mapped, ...prev]);
    setFilteredTransactions(prev => [mapped, ...prev]);
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
        return 'bg-black text-white border-black';
      case 'Overdue':
        return 'bg-accent text-white border-accent';
      case 'Available':
        return 'bg-gray-100 text-black border-gray-200';
      default:
        return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  // Get action badge styling
  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'Checked Out':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'Checked In':
        return 'bg-black text-white border-black';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-12">
      <div className="bg-black border-l-[16px] border-accent rounded-xl p-10 text-white relative overflow-hidden group">
        <div className="grid-bg opacity-[0.1]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">Activity Log</h1>
            <p className="text-white/40 text-[12px] font-black uppercase tracking-[0.4em] italic mb-2">// History of borrowed and returned tools //</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent">
                <FiSearch className="h-5 w-5" strokeWidth={4} />
              </div>
              <input
                type="text"
                placeholder="Search activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border-2 border-white/20 py-4 pl-12 pr-4 text-white placeholder:text-white/20 font-black uppercase text-xs tracking-widest focus:outline-none focus:border-accent focus:bg-white/20 transition-all rounded-lg"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="p-4 bg-white/5 border-2 border-white/10 text-white hover:bg-white hover:text-black transition-all rounded-lg"
                title="Refresh"
              >
                <FiRefreshCw className="h-6 w-6" strokeWidth={4} />
              </button>

              {canManage && (
                <button
                  onClick={handleOpenModal}
                  className="bg-accent text-white px-8 py-4 font-black uppercase italic tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all rounded-lg whitespace-nowrap"
                >
                  <FiPlus className="inline mr-2" strokeWidth={4} /> Take Tool
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table / Mobile Cards */}
      <div className="card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Tool</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Taken Out</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Returned</th>
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
                        {transaction.action === 'Taken Out' && transaction.status !== 'Available' && (
                          <button
                            onClick={() => handleCheckIn(transaction)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <FiArrowLeft className="mr-1 h-4 w-4" /> Return Tool
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

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {loading ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center">
                <FiArrowRight className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-600">
                  {searchTerm ? 'No transactions match your search.' : 'No transactions found.'}
                </p>
              </div>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{transaction.toolName}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{transaction.toolId}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeClass(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">User</span>
                    <div className="text-right">
                      <div className="text-gray-900 text-xs font-semibold">{transaction.userName}</div>
                      <div className="text-gray-500 font-mono text-[10px]">{transaction.userEmail}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Checked Out</span>
                    <span className="text-gray-900 text-xs">{transaction.checkoutDate ? formatDateTime(transaction.checkoutDate) : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Checked In</span>
                    <span className="text-gray-900 text-xs">{transaction.checkinDate ? formatDateTime(transaction.checkinDate) : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Due Date</span>
                    <span className="text-gray-900 text-xs">{transaction.dueDate ? formatDateTime(transaction.dueDate) : '—'}</span>
                  </div>
                </div>

                {canManage && transaction.action === 'Checked Out' && transaction.status !== 'Available' && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleCheckIn(transaction)}
                      className="w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <FiArrowLeft className="mr-1 h-4 w-4" /> Check In Tool
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionModal
          onClose={handleCloseModal}
          onTransactionComplete={handleTransactionComplete}
        />
      )}

      {/* Check In Confirmation Modal */}
      <ConfirmModal
        isOpen={!!transactionToCheckIn}
        onClose={() => setTransactionToCheckIn(null)}
        onConfirm={confirmCheckIn}
        title="Check In Tool"
        message={`Are you sure you want to check in the tool "${transactionToCheckIn?.toolName}"?`}
        confirmText="Check In"
        isDestructive={false}
        isProcessing={isCheckingIn}
      />
    </div>
  );
};

export default Transactions;