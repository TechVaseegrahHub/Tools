import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiTool, FiFilter, FiRefreshCw, FiGrid, FiList, FiHeart } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ToolFormModal from '../components/ToolFormModal';
import { toast } from 'react-toastify';

const ToolInventory = () => {
  const [tools, setTools] = useState([]); // Initial state is an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null); // Tool to edit
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [favorites, setFavorites] = useState(new Set());

  const { user } = useAuth(); // Get user role
  const canManage = user?.role === 'Admin' || user?.role === 'Manager'; // Added optional chaining for safety
  const isAdmin = user?.role === 'Admin'; // Added optional chaining for safety

  // Toggle favorite status
  const toggleFavorite = (toolId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(toolId)) {
        newFavorites.delete(toolId);
      } else {
        newFavorites.add(toolId);
      }
      return newFavorites;
    });
  };

  const fetchTools = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const { data } = await axios.get(`/api/tools?search=${searchTerm}`);

      // *** Correction: Ensure data is an array before setting state ***
      if (Array.isArray(data)) {
        setTools(data);
      } else {
        console.error("API did not return an array:", data);
        setTools([]); // Default to empty array if response is not valid
        setError('Received invalid data from server.');
        toast.error('Received invalid data from server.');
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch tools';
      setError(errorMessage);
      console.error('API Error:', err);
      setTools([]); // Ensure tools is an array even on error
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tools on mount and when searchTerm changes
  useEffect(() => {
    // Check if user exists before fetching, avoids unnecessary fetch if logged out
    if (user) {
        const delayDebounce = setTimeout(() => {
          fetchTools();
        }, 300); // Debounce search
        return () => clearTimeout(delayDebounce);
    } else {
        setLoading(false); // If no user, stop loading
        setTools([]); // Ensure tools is empty if no user
    }
  }, [searchTerm, user]); // Added user dependency

  const handleOpenModal = (tool = null) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTool(null);
    setIsModalOpen(false);
  };

  // Called from modal on successful save
  const handleSaveTool = (savedTool) => {
    if (editingTool) {
      // Update existing tool in state
      setTools(tools.map(t => t._id === savedTool._id ? savedTool : t));
      toast.success('Tool updated successfully!');
    } else {
      // Add new tool to state (prepend to show newest first)
      setTools([savedTool, ...tools]);
      toast.success('Tool added successfully!');
    }
    handleCloseModal();
  };

  const handleDeleteTool = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`/api/tools/${id}`);
      setTools(tools.filter(t => t._id !== id));
      setError(null); // Clear error on success
      toast.success('Tool deleted successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete tool';
      setError(errorMessage);
      console.error("Delete Error:", err);
      toast.error(errorMessage);
    }
  };

  const handleRefresh = () => {
    fetchTools();
    toast.info('Tools refreshed');
  };

  const statusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Checked Out':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Maintenance':
        return 'bg-blue-100 text-blue-800';
      case 'Retired':
        return 'bg-gray-100 text-gray-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusColorText = (status) => {
    switch (status) {
      case 'Available':
        return 'text-green-600';
      case 'Checked Out':
        return 'text-yellow-600';
      case 'Under Maintenance':
        return 'text-blue-600';
      case 'Retired':
        return 'text-gray-600';
      case 'Overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Tool Card Component - Amazon Style
  const ToolCard = ({ tool }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative">
        {tool.image ? (
          <img 
            src={tool.image} 
            alt={tool.toolName} 
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/400x300?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <FiTool className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(tool._id)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
            favorites.has(tool._id) 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <FiHeart className={`h-4 w-4 ${favorites.has(tool._id) ? 'fill-current' : ''}`} />
        </button>
        
        {/* Status Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(tool.status)}`}>
            {tool.status}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{tool.toolName}</h3>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium text-gray-900 mr-2">ID:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{tool.toolId}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium text-gray-900 mr-2">Category:</span>
            <span>{tool.category?.name || 'N/A'}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium text-gray-900 mr-2">Location:</span>
            <span>{tool.location || 'N/A'}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(tool)}
            className="flex-1 py-2 px-3 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-1"
            title={canManage ? "Edit Tool" : "View Details"}
          >
            {canManage ? <FiEdit className="h-4 w-4" /> : <FiSearch className="h-4 w-4" />}
            {canManage ? 'Edit' : 'View'}
          </button>
          
          {isAdmin && (
            <button
              onClick={() => handleDeleteTool(tool._id)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Delete Tool"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tool Inventory</h1>
          <p className="text-gray-600 mt-1">Manage and track all tools in your inventory</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              title="Grid View"
            >
              <FiGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              title="List View"
            >
              <FiList className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tools..."
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

          {/* Add New Tool Button */}
          {canManage && (
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center"
            >
              <FiPlus className="mr-2" /> Add Tool
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tools Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading tools...</p>
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <FiTool className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No tools match your search criteria.' : 'Get started by adding tools to your inventory.'}
            </p>
            {canManage && (
              <button
                onClick={() => handleOpenModal()}
                className="btn-primary flex items-center"
              >
                <FiPlus className="mr-2" /> Add Your First Tool
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{tools.length}</span> {tools.length === 1 ? 'tool' : 'tools'}
              {searchTerm && ` for "${searchTerm}"`}
            </p>
            {favorites.size > 0 && (
              <p className="text-sm text-gray-600">
                <FiHeart className="inline h-4 w-4 text-red-500 mr-1" />
                <span className="font-medium">{favorites.size}</span> favorited
              </p>
            )}
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <ToolCard key={tool._id} tool={tool} />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50">
                    <tr className="text-left">
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Tool Name</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Tool ID</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tools.map((tool) => (
                      <tr key={tool._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {tool.image ? (
                            <img 
                              src={tool.image} 
                              alt={tool.toolName} 
                              className="w-12 h-12 object-cover rounded-lg border"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.parentElement.innerHTML = '<div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center"><FiTool className="text-gray-500" /></div>';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <FiTool className="text-gray-500" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 font-medium">{tool.toolName}</td>
                        <td className="py-3 px-4 font-mono text-sm text-gray-600">{tool.toolId}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{tool.category?.name || <span className="text-gray-400 italic">N/A</span>}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(tool.status)}`}
                          >
                            {tool.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{tool.location || <span className="text-gray-400 italic">N/A</span>}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModal(tool)}
                              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                              title={canManage ? "Edit Tool" : "View Tool Details"}
                            >
                              {canManage ? <FiEdit className="h-4 w-4" /> : <FiSearch className="h-4 w-4" />}
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteTool(tool._id)}
                                className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                                title="Delete Tool"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ToolFormModal
          tool={editingTool}
          onSave={handleSaveTool}
          onClose={handleCloseModal}
          userRole={user.role} // Pass the role down
        />
      )}
    </div>
  );
};

export default ToolInventory;