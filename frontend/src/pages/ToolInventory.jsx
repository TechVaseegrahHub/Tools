import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiTool, FiFilter, FiRefreshCw, FiGrid, FiList, FiHeart, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ToolFormModal from '../components/ToolFormModal';
import UpgradeModal from '../components/UpgradeModal';
import { toast } from 'react-toastify';

// Skeleton card shown while loading
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-200 rounded flex-1" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="py-3 px-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

const ToolInventory = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toolToDelete, setToolToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Category state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({ id: 'ALL', name: 'All Categories' });
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 8;

  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'Manager';
  const isAdmin = user?.role === 'Admin';

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

  // Silently prefetch a page into the backend cache — fire and forget
  const silentPrefetch = (page, search = searchTerm, categoryId = selectedCategory.id) => {
    if (page < 1) return;
    axios.get(`/api/tools?search=${encodeURIComponent(search)}&page=${page}&limit=${ITEMS_PER_PAGE}&category=${encodeURIComponent(categoryId)}`)
      .catch(() => { }); // ignore errors — best-effort only
  };

  const fetchTools = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(
        `/api/tools?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=${ITEMS_PER_PAGE}&category=${encodeURIComponent(selectedCategory.id)}`
      );

      console.log("FETCHED TOOLS DATA AAYUDHA: ", { searchTerm, page, limit: ITEMS_PER_PAGE, category: selectedCategory.id, data });

      if (data && Array.isArray(data.tools)) {
        setTools(data.tools);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
        setCurrentPage(data.currentPage || 1);

        // Prefetch next + prev pages into backend cache while user reads this page
        silentPrefetch(page + 1, searchTerm, selectedCategory.id);
        if (page > 1) silentPrefetch(page - 1, searchTerm, selectedCategory.id);
      } else {
        setTools([]);
        setError('Received invalid data from server.');
        toast.error('Received invalid data from server.');
      }
    } catch (err) {
      setError('Failed to fetch tools');
      console.error('API Error:', err);
      setTools([]);
      toast.error('Failed to fetch tools');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    fetchTools(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when search or category changes, then fetch
  useEffect(() => {
    if (user) {
      const delayDebounce = setTimeout(() => {
        setCurrentPage(1);
        fetchTools(1);
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setLoading(false);
      setTools([]);
    }
  }, [searchTerm, selectedCategory.id, user]);

  // Fetch categories on mount
  useEffect(() => {
    if (user) {
      axios.get('/api/categories')
        .then(res => setCategories(res.data))
        .catch(err => console.error("Failed to fetch categories for filter", err));
    }
  }, [user]);

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

  const handleLimitReached = () => {
    setShowUpgradeModal(true);
  };

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    // Fetch user context again if we were relying on it, but server validation handles it
  };

  const handleDeleteTool = (tool) => {
    setToolToDelete(tool);
  };

  const confirmDelete = async () => {
    if (!toolToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/tools/${toolToDelete._id}`);
      setTools(tools.filter(t => t._id !== toolToDelete._id));
      setError(null); // Clear error on success
      toast.success('Tool deleted successfully!');
      setToolToDelete(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete tool';
      setError(errorMessage);
      console.error("Delete Error:", err);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    fetchTools(currentPage);
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

  // Tool Card Component
  const ToolCard = ({ tool }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image Section */}
      <div className="relative">
        {tool.image ? (
          <div className="w-full h-32 sm:h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
            <img
              src={tool.image}
              alt={tool.toolName}
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/400x300?text=No+Image';
              }}
            />
          </div>
        ) : (
          <div className="w-full h-32 sm:h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <FiTool className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(tool._id)}
          className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${favorites.has(tool._id)
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
        >
          <FiHeart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${favorites.has(tool._id) ? 'fill-current' : ''}`} />
        </button>

        {/* Status Badge */}
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-0.5 inline-flex text-[10px] sm:text-xs leading-5 font-semibold rounded-full ${statusColor(tool.status)}`}>
            {tool.status}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1 mb-1.5">{tool.toolName}</h3>

        <div className="space-y-1 sm:space-y-2 mb-3 flex-1">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <span className="font-medium text-gray-900 mr-1.5">ID:</span>
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] sm:text-xs truncate">{tool.toolId}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600 truncate">
            <span className="font-medium text-gray-900 mr-1.5 flex-shrink-0">Cat:</span>
            <span className="truncate">{tool.category?.name || 'N/A'}</span>
          </div>
          <div className="hidden sm:flex items-center text-sm text-gray-600">
            <span className="font-medium text-gray-900 mr-2">Location:</span>
            <span>{tool.location || 'N/A'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={() => handleOpenModal(tool)}
            className="flex-1 py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-1"
            title={canManage ? 'Edit Tool' : 'View Details'}
          >
            {canManage ? <FiEdit className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <FiSearch className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            {canManage ? 'Edit' : 'View'}
          </button>

          {isAdmin && (
            <button
              onClick={() => handleDeleteTool(tool)}
              className="p-1.5 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Delete Tool"
            >
              <FiTrash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="mb-6">
        {/* Row 1: Title + controls (always fully visible) */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Tool Inventory</h1>
            <p className="text-gray-600 mt-0.5 text-sm hidden md:block">Manage and track all tools in your inventory</p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Grid / List toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="Grid View"
              >
                <FiGrid className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="List View"
              >
                <FiList className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Refresh"
            >
              <FiRefreshCw className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            {/* Add Tool */}
            {canManage && (
              <button
                onClick={() => handleOpenModal()}
                className="btn-primary flex items-center text-sm py-2 px-3"
              >
                <FiPlus className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Add Tool</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Full-width search */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Category Dropdown Toggle */}
      <div className="mb-6 relative w-full md:w-64 z-20">
        <button
          onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-700 font-medium"
        >
          <div className="flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-gray-500" />
            <span className="truncate">{selectedCategory.name}</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isCategoryMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-60 overflow-y-auto py-1">
              <button
                onClick={() => { setSelectedCategory({ id: 'ALL', name: 'All Categories' }); setIsCategoryMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedCategory.id === 'ALL' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => { setSelectedCategory({ id: cat._id, name: cat.name }); setIsCategoryMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedCategory.id === cat._id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="truncate block">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tools Display */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    {['Image', 'Tool Name', 'Tool ID', 'Category', 'Status', 'Location', 'Actions'].map(h => (
                      <th key={h} className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...Array(ITEMS_PER_PAGE)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>

            {/* Mobile Skeletons */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        )
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
              Showing <span className="font-medium">{tools.length}</span> of <span className="font-medium">{totalCount}</span> {totalCount === 1 ? 'tool' : 'tools'}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {tools.map((tool) => (
                <ToolCard key={tool._id} tool={tool} />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="card overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
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
                                onClick={() => handleDeleteTool(tool)}
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

              {/* Mobile Cards for List View */}
              <div className="md:hidden flex flex-col divide-y divide-gray-100">
                {tools.map((tool) => (
                  <div key={tool._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        {tool.image ? (
                          <img
                            src={tool.image}
                            alt={tool.toolName}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.parentElement.innerHTML = '<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"><FiTool className="text-gray-400" /></div>';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                            <FiTool className="text-gray-400 h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 pr-2">{tool.toolName}</h3>
                          <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(tool.status)}`}>
                            {tool.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{tool.toolId}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-gray-500 font-medium">Category</span>
                        <span className="text-gray-900">{tool.category?.name || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-gray-500 font-medium">Location</span>
                        <span className="text-gray-900 truncate pl-2">{tool.location || '—'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(tool)}
                        className="flex-1 py-1.5 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 bg-white"
                      >
                        {canManage ? <FiEdit className="h-4 w-4" /> : <FiSearch className="h-4 w-4" />}
                        {canManage ? 'Edit' : 'View'}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteTool(tool)}
                          className="flex-1 py-1.5 px-3 border border-red-200 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <FiTrash2 className="h-4 w-4" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>

              {/* Page number buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg border transition-colors ${item === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {item}
                    </button>
                  )
                )
              }

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <ToolFormModal
          tool={editingTool}
          onSave={handleSaveTool}
          onClose={handleCloseModal}
          userRole={user.role} // Pass the role down
          onLimitReached={handleLimitReached}
        />
      )}

      {/* Delete Confirmation Modal */}
      {toolToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center transform transition-all">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4">
              <FiTrash2 className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Tool</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{toolToDelete.toolName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 flex-col sm:flex-row">
              <button
                onClick={() => setToolToDelete(null)}
                className="btn-outline flex-1"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold flex-1 py-2 px-4 rounded-lg flex justify-center items-center shadow-md transition-all"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
      />
    </div>
  );
};

export default ToolInventory;