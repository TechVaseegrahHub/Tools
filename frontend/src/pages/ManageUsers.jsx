import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiUser, FiUsers, FiEdit, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  const { user: currentUser } = useAuth();

  // Helper function to ensure we always have an array
  const ensureArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    }
    console.warn('Expected array but received:', data);
    return [];
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/users');
        const usersArray = ensureArray(res.data);
        setUsers(usersArray);
        setFilteredUsers(usersArray);
      } catch (error) {
        console.error('Failed to fetch users', error);
        toast.error('Failed to fetch users');
        // Set defaults to prevent errors
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleRefresh = () => {
    // Re-fetch users
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/users');
        const usersArray = ensureArray(res.data);
        setUsers(usersArray);
        setFilteredUsers(usersArray);
        toast.info('Users refreshed');
      } catch (error) {
        console.error('Failed to fetch users', error);
        toast.error('Failed to fetch users');
        // Set defaults to prevent errors
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
      setFilteredUsers(filteredUsers.filter(user => user._id !== id));
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Failed to delete user', error);
      toast.error('Failed to delete user');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
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

          <button className="btn-primary flex items-center">
            <FiPlus className="mr-2" /> Add User
          </button>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                      <p className="text-gray-600">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <FiUsers className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-600">
                        {searchTerm ? 'No users match your search.' : 'No users found.'}
                      </p>
                      <button className="mt-3 btn-primary flex items-center">
                        <FiPlus className="mr-2" /> Add Your First User
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="bg-gray-200 rounded-full p-2">
                          <FiUser className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                          title="Edit User"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        {currentUser?._id !== user._id && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                            title="Delete User"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;