import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiPlus, FiTool, FiTag, FiInfo, FiCalendar, FiMapPin, FiSave, FiImage } from 'react-icons/fi';
import ImageEditor from './ImageEditor';

const ToolFormModal = ({ tool, onSave, onClose, userRole }) => {
  const [formData, setFormData] = useState({
    toolName: '',
    toolId: '',
    category: '',
    status: 'Available',
    purchaseDate: '',
    location: '',
    image: ''
  });
  const [categories, setCategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useImageEditor, setUseImageEditor] = useState(false);

  const isEditMode = !!tool;

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Pre-fill form if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setFormData({
        toolName: tool.toolName,
        toolId: tool.toolId,
        category: tool.category._id, // Use category ID
        status: tool.status,
        purchaseDate: tool.purchaseDate ? tool.purchaseDate.split('T')[0] : '', // Format date for input
        location: tool.location,
        image: tool.image || ''
      });
    }
  }, [tool, isEditMode]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (imageUrl) => {
    setFormData((prev) => ({ ...prev, image: imageUrl }));
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    if (value === 'new') {
      setShowNewCategory(true);
      setFormData((prev) => ({ ...prev, category: '' }));
    } else {
      setShowNewCategory(false);
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  const handleSaveNewCategory = async () => {
    if (!newCategoryName) return;
    try {
      const { data: newCategory } = await axios.post('/api/categories', { name: newCategoryName });
      setCategories((prev) => [...prev, newCategory]);
      setFormData((prev) => ({ ...prev, category: newCategory._id }));
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const apiCall = isEditMode
      ? axios.put(`/api/tools/${tool._id}`, formData)
      : axios.post('/api/tools', formData);

    try {
      const { data } = await apiCall;
      onSave(data); // Pass the new/updated tool back to the parent
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save tool');
    } finally {
      setLoading(false);
    }
  };

  // Only Admin/Manager can edit fields
  const isReadOnly = userRole === 'Employee';

  return (
    // Modal Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-lg mr-3">
              <FiTool className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Edit Tool' : 'Add New Tool'}
            </h2>
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
              {/* Tool Name */}
              <div>
                <label htmlFor="toolName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiTool className="mr-2 h-4 w-4" /> Tool Name *
                </label>
                <input
                  type="text"
                  id="toolName"
                  name="toolName"
                  value={formData.toolName}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  required
                  className="input-field"
                  placeholder="e.g., Hammer, Drill, etc."
                />
              </div>
              {/* Tool ID */}
              <div>
                <label htmlFor="toolId" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiTag className="mr-2 h-4 w-4" /> Tool ID / Serial Number *
                </label>
                <input
                  type="text"
                  id="toolId"
                  name="toolId"
                  value={formData.toolId}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  required
                  className="input-field"
                  placeholder="e.g., HMR-001, DRL-002, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiInfo className="mr-2 h-4 w-4" /> Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  disabled={isReadOnly}
                  required
                  className="input-field"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                  {!isReadOnly && <option value="new" className="font-bold text-blue-600">+ Create New Category</option>}
                </select>
              </div>
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  className="input-field"
                >
                  <option value="Available">Available</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Retired">Retired</option>
                  {isEditMode && <option value="Checked Out">Checked Out</option>} {/* Only show 'Checked Out' if editing */}
                  {isEditMode && <option value="Overdue">Overdue</option>} {/* Only show 'Overdue' if editing */}
                </select>
              </div>
            </div>

            {/* Create New Category Inline Form */}
            {showNewCategory && !isReadOnly && (
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewCategory}
                    className="btn-primary flex items-center"
                  >
                    <FiPlus className="mr-2" /> Save
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Purchase Date */}
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiCalendar className="mr-2 h-4 w-4" /> Purchase Date
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  className="input-field"
                />
              </div>
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiMapPin className="mr-2 h-4 w-4" /> Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="e.g., Shelf B, Row 3"
                  className="input-field"
                />
              </div>
            </div>

            {/* Enhanced Image Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiImage className="mr-2 h-4 w-4" /> Image
                </label>
                <button
                  type="button"
                  onClick={() => setUseImageEditor(!useImageEditor)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    useImageEditor 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {useImageEditor ? 'Use Simple Input' : 'Use Image Editor'}
                </button>
              </div>
              
              {useImageEditor ? (
                <ImageEditor
                  imageUrl={formData.image}
                  onChange={handleImageChange}
                  aspectRatio={4/3}
                  className="border rounded-lg"
                />
              ) : (
                <>
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    placeholder="https://example.com/tool-image.jpg"
                    className="input-field"
                  />
                  {formData.image && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-2">Preview:</div>
                      <img 
                        src={formData.image} 
                        alt="Tool preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Form Actions */}
            {!isReadOnly && (
              <div className="flex justify-end pt-4 gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-outline"
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      {isEditMode ? 'Save Changes' : 'Create Tool'}
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ToolFormModal;