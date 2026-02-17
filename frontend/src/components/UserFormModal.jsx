import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiUser, FiMail, FiLock, FiShield, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';

const UserFormModal = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Employee'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = !!user;

    // Pre-fill form if in edit mode
    useEffect(() => {
        if (isEditMode) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Don't pre-fill password for security
                role: user.role
            });
        }
    }, [user, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Prepare data - don't send password if it's empty in edit mode
        const submitData = { ...formData };
        if (isEditMode && !submitData.password) {
            delete submitData.password;
        }

        const apiCall = isEditMode
            ? axios.put(`/api/users/${user._id}`, submitData)
            : axios.post('/api/users', submitData);

        try {
            const { data } = await apiCall;
            onSave(data); // Pass the new/updated user back to the parent
            toast.success(isEditMode ? 'User updated successfully!' : 'User created successfully!');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to save user';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Modal Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
                    <div className="flex items-center">
                        <div className="bg-primary-100 p-2 rounded-lg mr-3">
                            <FiUser className="h-6 w-6 text-primary-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isEditMode ? 'Edit User' : 'Add New User'}
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
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <FiUser className="mr-2 h-4 w-4" /> Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="e.g., John Doe"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <FiMail className="mr-2 h-4 w-4" /> Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="john.doe@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <FiLock className="mr-2 h-4 w-4" /> Password {isEditMode ? '(leave blank to keep current)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!isEditMode}
                                    className="input-field"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                {!isEditMode && (
                                    <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                                )}
                            </div>

                            {/* Role */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <FiShield className="mr-2 h-4 w-4" /> Role *
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Form Actions */}
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
                                        {isEditMode ? 'Save Changes' : 'Create User'}
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

export default UserFormModal;
