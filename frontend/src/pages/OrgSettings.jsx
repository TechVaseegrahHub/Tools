import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiGlobe, FiLock, FiSave, FiCheckCircle, FiRefreshCw, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const OrgSettings = () => {
    const { user, login } = useAuth();

    // Org Info state
    const [orgName, setOrgName] = useState('');
    const [orgSlug, setOrgSlug] = useState('');
    const [orgLoading, setOrgLoading] = useState(true);
    const [orgSaving, setOrgSaving] = useState(false);

    // Change Password state
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving, setPwSaving] = useState(false);

    // Load org settings
    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const { data } = await axios.get('/api/org/settings');
                setOrgName(data.name);
                setOrgSlug(data.slug);
            } catch {
                toast.error('Failed to load org settings');
            } finally {
                setOrgLoading(false);
            }
        };
        fetchOrg();
    }, []);

    const handleOrgSave = async (e) => {
        e.preventDefault();
        if (!orgName.trim()) return;
        setOrgSaving(true);
        try {
            const { data } = await axios.put('/api/org/settings', { name: orgName });
            setOrgSlug(data.org.slug);
            toast.success('Organization name updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        } finally {
            setOrgSaving(false);
        }
    };

    const handlePwChange = (e) => setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
        if (pwForm.newPassword.length < 6) { toast.error('Minimum 6 characters'); return; }
        setPwSaving(true);
        try {
            await axios.put('/api/auth/change-password', {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            });
            toast.success('Password changed successfully!');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPwSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your organization and account settings</p>
            </div>

            {/* ─── Org Info Card ─── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <FiGlobe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-800">Organization Info</h2>
                        <p className="text-xs text-gray-500">Update your organization's display name</p>
                    </div>
                </div>

                {orgLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-blue-600" />
                    </div>
                ) : (
                    <form onSubmit={handleOrgSave} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Organization Name</label>
                            <input
                                type="text"
                                value={orgName}
                                onChange={e => setOrgName(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                placeholder="Your Company Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (Auto-generated)</label>
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm">
                                <FiInfo className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="font-mono">{orgSlug}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Auto-updated when you change the name</p>
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={orgSaving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60">
                                {orgSaving ? <FiRefreshCw className="animate-spin h-4 w-4" /> : <FiSave className="h-4 w-4" />}
                                {orgSaving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* ─── Change Password Card ─── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                        <FiLock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-800">Change Password</h2>
                        <p className="text-xs text-gray-500">Update your admin account password</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={pwForm.currentPassword}
                            onChange={handlePwChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={pwForm.newPassword}
                                onChange={handlePwChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                placeholder="Min 6 chars"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={pwForm.confirmPassword}
                                onChange={handlePwChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={pwSaving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-sm disabled:opacity-60">
                            {pwSaving ? <FiRefreshCw className="animate-spin h-4 w-4" /> : <FiCheckCircle className="h-4 w-4" />}
                            {pwSaving ? 'Saving…' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Account info (read only) */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Account</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-gray-400 text-xs">Name</p>
                        <p className="font-medium text-gray-800">{user?.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Email</p>
                        <p className="font-medium text-gray-800">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Role</p>
                        <p className="font-medium text-gray-800">{user?.role}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Organization</p>
                        <p className="font-medium text-gray-800">{user?.org?.name || '—'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrgSettings;
