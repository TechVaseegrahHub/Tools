import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiTool, FiArrowRight, FiRefreshCw, FiToggleLeft, FiToggleRight, FiAlertCircle, FiCheckCircle, FiGlobe, FiLock, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StatCard = ({ label, value, color }) => (
    <div className={`bg-${color}-50 rounded-xl p-4 border border-${color}-100`}>
        <p className={`text-xs font-medium text-${color}-600 uppercase tracking-wide`}>{label}</p>
        <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{value ?? '—'}</p>
    </div>
);

// Per-user row with inline password reset form
const UserRow = ({ user }) => {
    const [showReset, setShowReset] = useState(false);
    const [pwd, setPwd] = useState('');
    const [saving, setSaving] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        if (pwd.length < 6) { toast.error('Min 6 characters'); return; }
        setSaving(true);
        try {
            const { data } = await axios.put(`/api/superadmin/users/${user._id}/reset-password`, { newPassword: pwd });
            toast.success(data.message);
            setPwd('');
            setShowReset(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-3">
                <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                    <FiUsers className="h-4 w-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 flex-shrink-0">
                    {user.role}
                </span>
                <button
                    onClick={() => { setShowReset(s => !s); setPwd(''); }}
                    className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${showReset ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-200 hover:text-purple-600'}`}
                    title="Reset Password"
                >
                    {showReset ? <FiX className="h-4 w-4" /> : <FiLock className="h-4 w-4" />}
                </button>
            </div>
            {showReset && (
                <form onSubmit={handleReset} className="px-3 pb-3 flex gap-2">
                    <input
                        type="password"
                        value={pwd}
                        onChange={e => setPwd(e.target.value)}
                        placeholder="New password (min 6 chars)"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    />
                    <button type="submit" disabled={saving}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center gap-1">
                        {saving ? <FiRefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FiCheckCircle className="h-3.5 w-3.5" />}
                        {saving ? '' : 'Set'}
                    </button>
                </form>
            )}
        </div>
    );
};


const SuperAdminDashboard = () => {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [orgDetail, setOrgDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/superadmin/orgs');
            setOrgs(data);
        } catch {
            toast.error('Failed to load organizations');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrgDetail = async (orgId) => {
        setDetailLoading(true);
        try {
            const { data } = await axios.get(`/api/superadmin/orgs/${orgId}`);
            setOrgDetail(data);
        } catch {
            toast.error('Failed to load org details');
        } finally {
            setDetailLoading(false);
        }
    };

    const toggleOrg = async (orgId, e) => {
        e.stopPropagation();
        setTogglingId(orgId);
        try {
            const { data } = await axios.put(`/api/superadmin/orgs/${orgId}/toggle`);
            setOrgs(prev => prev.map(o => o._id === orgId ? { ...o, isActive: data.isActive } : o));
            if (orgDetail?.org?._id === orgId) {
                setOrgDetail(prev => ({ ...prev, org: { ...prev.org, isActive: data.isActive } }));
            }
            toast.success(data.message);
        } catch {
            toast.error('Failed to toggle org status');
        } finally {
            setTogglingId(null);
        }
    };

    useEffect(() => { fetchOrgs(); }, []);

    const handleOrgClick = (org) => {
        setSelectedOrg(org);
        fetchOrgDetail(org._id);
    };

    const totalStats = orgs.reduce(
        (acc, o) => ({ tools: acc.tools + (o.stats?.tools || 0), users: acc.users + (o.stats?.users || 0), transactions: acc.transactions + (o.stats?.transactions || 0) }),
        { tools: 0, users: 0, transactions: 0 }
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-lg">
                            <FiGlobe className="h-5 w-5" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-11">Manage all organizations on the platform</p>
                </div>
                <button
                    onClick={fetchOrgs}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium shadow-sm"
                >
                    <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg col-span-2 sm:col-span-1">
                    <p className="text-purple-200 text-xs font-semibold uppercase tracking-wide">Total Orgs</p>
                    <p className="text-4xl font-bold mt-1">{orgs.length}</p>
                    <p className="text-purple-300 text-xs mt-2">{orgs.filter(o => o.isActive).length} active</p>
                </div>
                <StatCard label="Total Tools" value={totalStats.tools} color="blue" />
                <StatCard label="Total Users" value={totalStats.users} color="green" />
                <StatCard label="Transactions" value={totalStats.transactions} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Org List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-800">Organizations</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Click an org to see details</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600" />
                        </div>
                    ) : orgs.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <FiGlobe className="h-10 w-10 mx-auto mb-3 opacity-40" />
                            <p className="text-sm">No organizations yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {orgs.map(org => (
                                <div
                                    key={org._id}
                                    onClick={() => handleOrgClick(org)}
                                    className={`flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedOrg?._id === org._id ? 'bg-purple-50 border-l-4 border-purple-500' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900 truncate">{org.name}</p>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {org.isActive ? <FiCheckCircle className="h-3 w-3" /> : <FiAlertCircle className="h-3 w-3" />}
                                                {org.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {org.stats?.tools} tools · {org.stats?.users} users · {org.stats?.transactions} txns
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => toggleOrg(org._id, e)}
                                        disabled={togglingId === org._id}
                                        className={`ml-4 p-1.5 rounded-lg transition-colors ${org.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                                        title={org.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {togglingId === org._id
                                            ? <FiRefreshCw className="h-5 w-5 animate-spin" />
                                            : org.isActive
                                                ? <FiToggleRight className="h-5 w-5" />
                                                : <FiToggleLeft className="h-5 w-5" />
                                        }
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Org Detail Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-800">
                            {selectedOrg ? `${selectedOrg.name} — Details` : 'Organization Details'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {selectedOrg ? `Slug: ${selectedOrg.slug}` : 'Select an org from the list'}
                        </p>
                    </div>

                    {!selectedOrg ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <FiArrowRight className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm">Select an organization</p>
                        </div>
                    ) : detailLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600" />
                        </div>
                    ) : orgDetail ? (
                        <div className="p-6 space-y-5">
                            {/* Detail stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center bg-blue-50 rounded-xl p-3">
                                    <FiTool className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-blue-700">{orgDetail.stats.tools}</p>
                                    <p className="text-xs text-blue-500">Tools</p>
                                </div>
                                <div className="text-center bg-green-50 rounded-xl p-3">
                                    <FiUsers className="h-5 w-5 text-green-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-green-700">{orgDetail.stats.users}</p>
                                    <p className="text-xs text-green-500">Users</p>
                                </div>
                                <div className="text-center bg-orange-50 rounded-xl p-3">
                                    <FiArrowRight className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-orange-700">{orgDetail.stats.transactions}</p>
                                    <p className="text-xs text-orange-500">Txns</p>
                                </div>
                            </div>

                            {/* User list */}
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-3">Users in this org</p>
                                {orgDetail.userList.length === 0 ? (
                                    <p className="text-sm text-gray-400">No users</p>
                                ) : (
                                    <div className="space-y-2 max-h-72 overflow-y-auto">
                                        {orgDetail.userList.map(u => (
                                            <UserRow key={u._id} user={u} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
