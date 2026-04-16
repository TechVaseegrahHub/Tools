import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FiUsers, FiTool, FiArrowRight, FiRefreshCw, FiToggleLeft, FiToggleRight,
    FiAlertCircle, FiCheckCircle, FiGlobe, FiLock, FiX,
    FiStar, FiZap, FiShield, FiClock, FiCreditCard, FiEdit2, FiTrash2
} from 'react-icons/fi';
import { toast } from 'react-toastify';

/* ─── helpers ─────────────────────────────────────────── */
const daysRemaining = (endDate) => {
    if (!endDate) return 0;
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/* ─── Days ring ───────────────────────────────────────── */
const DaysRing = ({ days, max = 31 }) => {
    const pct = Math.min(days / max, 1);
    const r = 28;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - pct);
    const color = days <= 5 ? '#ef4444' : days <= 10 ? '#f59e0b' : '#10b981';
    return (
        <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                <circle
                    cx="32" cy="32" r={r} fill="none"
                    stroke={color} strokeWidth="5"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
            </svg>
            <div className="text-center z-10">
                <p className="text-xl font-bold text-white leading-none">{days}</p>
                <p className="text-[10px] text-purple-200 leading-none mt-0.5">days</p>
            </div>
        </div>
    );
};

/* ─── Plan badge ──────────────────────────────────────── */
const PlanBadge = ({ plan }) => {
    if (plan === 'premium') {
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"><FiStar className="h-3 w-3" />Premium</span>;
    }
    if (plan === 'free_premium') {
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700"><FiStar className="h-3 w-3" />Free Premium</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Free</span>;
};

/* ─── Status dot badge ────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const map = {
        active: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
        halted: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Halted' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500', label: 'Cancelled' },
        created: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Pending' },
    };
    const s = map[status] || map.active;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
};

/* ─── StatCard (org tab) ──────────────────────────────── */
const StatCard = ({ label, value, color }) => (
    <div className={`bg-${color}-50 rounded-xl p-4 border border-${color}-100`}>
        <p className={`text-xs font-medium text-${color}-600 uppercase tracking-wide`}>{label}</p>
        <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{value ?? '—'}</p>
    </div>
);

/* ─── Per-user row with inline password reset ─────────── */
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

/* ═══════════════════════════════════════════════════════ */
/*  SUBSCRIPTION MANAGEMENT TAB                           */
/* ═══════════════════════════════════════════════════════ */
const SubscriptionManagement = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | premium | free
    const [selectedOrg, setSelectedOrg] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: res } = await axios.get('/api/superadmin/subscriptions');
            setData(res);
        } catch {
            toast.error('Failed to load subscription data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = data?.orgs?.filter(o => {
        if (filter === 'premium') return o.subscriptionPlan === 'premium' || o.subscriptionPlan === 'free_premium';
        if (filter === 'free') return o.subscriptionPlan !== 'premium' && o.subscriptionPlan !== 'free_premium';
        return true;
    }) ?? [];

    const days = selectedOrg ? daysRemaining(selectedOrg.currentPeriodEnd) : 0;
    const isPremium = selectedOrg?.subscriptionPlan === 'premium' || selectedOrg?.subscriptionPlan === 'free_premium';

    return (
        <div className="space-y-6">
            {/* ── Stats bar ── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: FiStar, label: 'Premium Orgs', value: data?.summary?.premium ?? '—', from: 'from-yellow-500', to: 'to-amber-600' },
                    { icon: FiShield, label: 'Free Orgs', value: data?.summary?.free ?? '—', from: 'from-gray-400', to: 'to-gray-500' },
                    { icon: FiGlobe, label: 'Total Orgs', value: data?.summary?.total ?? '—', from: 'from-indigo-500', to: 'to-purple-600' },
                ].map(({ icon: Icon, label, value, from, to }) => (
                    <div key={label} className={`bg-gradient-to-br ${from} ${to} rounded-2xl p-5 text-white shadow-md`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-4 w-4 opacity-80" />
                            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</p>
                        </div>
                        <p className="text-3xl font-bold">{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* ── Left: Filter + Org list ── */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    {/* Filter pills */}
                    <div className="px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'premium', label: '✦ Premium' },
                                { key: 'free', label: 'Free' },
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => { setFilter(key); setSelectedOrg(null); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === key
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {label}
                                </button>
                            ))}
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="ml-auto p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                                title="Refresh"
                            >
                                <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Org list */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <FiStar className="h-10 w-10 mb-3 opacity-30" />
                                <p className="text-sm">No orgs in this filter</p>
                            </div>
                        ) : filtered.map(org => {
                            const d = daysRemaining(org.currentPeriodEnd);
                            const isSelected = selectedOrg?._id === org._id;
                            return (
                                <div
                                    key={org._id}
                                    onClick={() => setSelectedOrg(org)}
                                    className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${isSelected ? 'bg-indigo-50 border-indigo-500' : 'border-transparent'}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{org.name}</p>
                                            <PlanBadge plan={org.subscriptionPlan} />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{org.slug}</p>
                                        {(org.subscriptionPlan === 'premium' || org.subscriptionPlan === 'free_premium') && (
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <StatusBadge status={org.subscriptionStatus} />
                                                {org.currentPeriodEnd && (
                                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${d <= 5 ? 'bg-red-100 text-red-600' : d <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {d}d left
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">Expires {fmtDate(org.currentPeriodEnd)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <FiArrowRight className={`h-4 w-4 mt-1 flex-shrink-0 ${isSelected ? 'text-indigo-500' : 'text-gray-300'}`} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Right: Detail panel ── */}
                <div className={`lg:col-span-3 rounded-2xl shadow-sm border overflow-hidden ${isPremium && selectedOrg
                    ? 'bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 border-purple-700'
                    : 'bg-white border-gray-100'}`}>

                    {!selectedOrg ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-64 py-24 text-gray-400">
                            <FiCreditCard className="h-12 w-12 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Select an organization</p>
                            <p className="text-xs mt-1 opacity-70">to view subscription details</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className={`px-6 py-4 border-b flex items-center justify-between ${isPremium ? 'border-purple-700/40' : 'border-gray-100'}`}>
                                <div>
                                    <p className={`font-bold text-lg ${isPremium ? 'text-white' : 'text-gray-900'}`}>{selectedOrg.name}</p>
                                    <p className={`text-xs mt-0.5 ${isPremium ? 'text-purple-300' : 'text-gray-400'}`}>/{selectedOrg.slug}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PlanBadge plan={selectedOrg.subscriptionPlan} />
                                    {isPremium && <StatusBadge status={selectedOrg.subscriptionStatus} />}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-5">
                                {isPremium ? (
                                    <>
                                        {/* Ring + summary */}
                                        <div className="flex items-center gap-5">
                                            <div className="flex flex-col items-center gap-1">
                                                <DaysRing days={days} max={31} />
                                                <p className="text-purple-300 text-[10px] uppercase tracking-wide font-semibold">days left</p>
                                            </div>
                                            <div>
                                                <p className="text-white text-lg font-bold">Premium Plan</p>
                                                <p className="text-purple-300 text-xs mt-0.5">
                                                    {days > 0
                                                        ? `${days} day${days !== 1 ? 's' : ''} remaining · renews ${fmtDate(selectedOrg.currentPeriodEnd)}`
                                                        : <span className="text-red-400">Subscription expires today</span>
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* 6-stat grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {[
                                                { label: 'Plan', value: selectedOrg.subscriptionPlan === 'free_premium' ? 'Free Premium ✦' : 'Premium ✦' },
                                                { label: 'Status', value: selectedOrg.subscriptionStatus ? selectedOrg.subscriptionStatus.charAt(0).toUpperCase() + selectedOrg.subscriptionStatus.slice(1) : '—' },
                                                { label: 'Days Used', value: selectedOrg.currentPeriodEnd ? `${30 - days} / 30` : '—' },
                                                {
                                                    label: 'Subscribed On',
                                                    value: selectedOrg.currentPeriodEnd
                                                        ? fmtDate(new Date(new Date(selectedOrg.currentPeriodEnd).getTime() - 30 * 24 * 60 * 60 * 1000))
                                                        : '—'
                                                },
                                                { label: 'Expires On', value: fmtDate(selectedOrg.currentPeriodEnd) },
                                                {
                                                    label: 'Subscription ID',
                                                    value: selectedOrg.razorpaySubscriptionId ? selectedOrg.razorpaySubscriptionId.slice(0, 14) + '…' : '—',
                                                    mono: true
                                                },
                                            ].map(({ label, value, mono }) => (
                                                <div key={label} className="bg-white/10 rounded-xl px-3 py-3">
                                                    <p className="text-purple-300 text-[10px] uppercase tracking-wide font-semibold mb-0.5">{label}</p>
                                                    <p className={`text-white font-semibold ${mono ? 'font-mono text-xs' : 'text-sm'}`}>{value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Perks */}
                                        <div className="border-t border-purple-700/40 pt-4 grid grid-cols-3 gap-2">
                                            {['Unlimited Tools', 'Full Reports', 'Priority Support'].map(perk => (
                                                <div key={perk} className="flex items-center gap-1.5 text-xs text-purple-200">
                                                    <FiCheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                                    {perk}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    /* Free plan view */
                                    <div className="flex flex-col items-center py-8 text-center">
                                        <div className="bg-gray-100 rounded-2xl p-5 mb-4">
                                            <FiZap className="h-10 w-10 text-gray-400 mx-auto" />
                                        </div>
                                        <p className="text-gray-700 font-bold text-lg">Free Plan</p>
                                        <p className="text-gray-400 text-sm mt-1">This organization has not upgraded to Premium</p>
                                    </div>
                                )}

                                {/* Org meta — always shown */}
                                <div className={`rounded-xl p-4 ${isPremium ? 'bg-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isPremium ? 'text-purple-300' : 'text-gray-400'}`}>Organization Info</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { icon: FiUsers, label: 'Users', value: selectedOrg.stats?.users ?? 0, color: isPremium ? 'text-purple-200' : 'text-blue-600' },
                                            { icon: FiTool, label: 'Tools', value: selectedOrg.stats?.tools ?? 0, color: isPremium ? 'text-purple-200' : 'text-green-600' },
                                            { icon: FiArrowRight, label: 'Txns', value: selectedOrg.stats?.transactions ?? 0, color: isPremium ? 'text-purple-200' : 'text-orange-500' },
                                        ].map(({ icon: Icon, label, value, color }) => (
                                            <div key={label} className="text-center">
                                                <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
                                                <p className={`text-lg font-bold ${isPremium ? 'text-white' : 'text-gray-800'}`}>{value}</p>
                                                <p className={`text-xs ${isPremium ? 'text-purple-400' : 'text-gray-400'}`}>{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <div>
                                            <p className={`text-[10px] uppercase tracking-wide ${isPremium ? 'text-purple-400' : 'text-gray-400'}`}>Registered</p>
                                            <p className={`text-xs font-semibold mt-0.5 ${isPremium ? 'text-white' : 'text-gray-700'}`}>{fmtDate(selectedOrg.createdAt)}</p>
                                        </div>
                                        <div>
                                            <p className={`text-[10px] uppercase tracking-wide ${isPremium ? 'text-purple-400' : 'text-gray-400'}`}>Status</p>
                                            <p className={`text-xs font-semibold mt-0.5 ${selectedOrg.isActive ? (isPremium ? 'text-emerald-400' : 'text-emerald-600') : 'text-red-400'}`}>
                                                {selectedOrg.isActive ? '● Active' : '● Inactive'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════ */
/*  MAIN SUPER ADMIN DASHBOARD                            */
/* ═══════════════════════════════════════════════════════ */
const SuperAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orgs'); // orgs | subscriptions
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [orgDetail, setOrgDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
    const [savingEdit, setSavingEdit] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingOrg, setDeletingOrg] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Free Upgrade Modal State
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [upgradeDuration, setUpgradeDuration] = useState('1_month');
    const [upgrading, setUpgrading] = useState(false);

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

    const handleEditClick = (org, e) => {
        e.stopPropagation();
        setSelectedOrg(org);
        setEditForm({ name: org.name || '', email: org.email || '', phone: org.phone || '' });
        setIsEditModalOpen(true);
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        setSavingEdit(true);
        try {
            const { data } = await axios.put(`/api/superadmin/orgs/${selectedOrg._id}`, editForm);
            setOrgs(prev => prev.map(o => o._id === selectedOrg._id ? { ...o, ...editForm } : o));
            if (orgDetail?.org?._id === selectedOrg._id) {
                setOrgDetail(prev => ({ ...prev, org: { ...prev.org, ...editForm } }));
            }
            toast.success(data.message);
            setIsEditModalOpen(false);
        } catch {
            toast.error('Failed to update organization');
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDeleteClick = (org, e) => {
        e.stopPropagation();
        setDeletingOrg(org);
        setDeleteConfirmText('');
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            const { data } = await axios.delete(`/api/superadmin/orgs/${deletingOrg._id}`);
            setOrgs(prev => prev.filter(o => o._id !== deletingOrg._id));
            if (selectedOrg?._id === deletingOrg._id) {
                setSelectedOrg(null);
                setOrgDetail(null);
            }
            toast.success(data.message);
            setIsDeleteModalOpen(false);
        } catch {
            toast.error('Failed to delete organization');
        } finally {
            setDeleting(false);
        }
    };

    const handleFreeUpgrade = async () => {
        if (!selectedOrg) return;
        setUpgrading(true);
        try {
            const { data } = await axios.put(`/api/superadmin/orgs/${selectedOrg._id}/free-upgrade`, {
                duration: upgradeDuration
            });
            // Update local state to reflect premium status immediately
            setOrgs(prev => prev.map(o => o._id === selectedOrg._id ? { ...o, subscriptionPlan: 'premium', subscriptionStatus: 'active' } : o));
            setSelectedOrg(data.org);
            if (orgDetail?.org?._id === selectedOrg._id) {
                setOrgDetail(prev => ({ ...prev, org: data.org }));
            }
            toast.success(data.message);
            setIsUpgradeModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upgrade organization');
        } finally {
            setUpgrading(false);
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

    const TABS = [
        { key: 'orgs', label: 'Organizations', icon: FiGlobe },
        { key: 'subscriptions', label: 'Subscription Management', icon: FiStar },
    ];

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
                {activeTab === 'orgs' && (
                    <button
                        onClick={fetchOrgs}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium shadow-sm"
                    >
                        <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                )}
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === key
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── ORGANIZATIONS TAB ── */}
            {activeTab === 'orgs' && (
                <>
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
                                                    <PlanBadge plan={org.subscriptionPlan} />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {org.stats?.tools} tools · {org.stats?.users} users · {org.stats?.transactions} txns
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => handleEditClick(org, e)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="Edit Organization"
                                                >
                                                    <FiEdit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(org, e)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Delete Organization"
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => toggleOrg(org._id, e)}
                                                    disabled={togglingId === org._id}
                                                    className={`p-1.5 ml-1 rounded-lg transition-colors ${org.isActive ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}
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
                </>
            )}

            {/* ── SUBSCRIPTION MANAGEMENT TAB ── */}
            {activeTab === 'subscriptions' && <SubscriptionManagement />}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Edit Organization</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submitEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-b border-gray-100 pb-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-70"
                                >
                                    {savingEdit && <FiRefreshCw className="h-4 w-4 animate-spin" />}
                                    Save Changes
                                </button>
                            </div>

                            {/* Free Premium Override Section inside Edit Modal */}
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mt-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiStar className="h-4 w-4 text-amber-500" />
                                    <h4 className="font-semibold text-sm text-amber-900">Administrative Override</h4>
                                </div>
                                <p className="text-xs text-amber-700 mb-3">
                                    Manually grant or extend Free Premium access without logging a payment transaction.
                                </p>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={upgradeDuration}
                                        onChange={(e) => setUpgradeDuration(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm border border-amber-200 rounded-lg bg-white text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                    >
                                        <option value="1_month">1 Month</option>
                                        <option value="1_year">1 Year</option>
                                        <option value="lifetime">Lifetime</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditModalOpen(false); // close edit to open confirmation, or just submit
                                            handleFreeUpgrade();
                                        }}
                                        disabled={upgrading}
                                        className="px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-colors whitespace-nowrap"
                                    >
                                        {upgrading ? 'Upgrading...' : 'Apply Premium Override'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 bg-red-50 flex items-start gap-4 border-b border-red-100">
                            <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                                <FiAlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-900">Delete Organization</h3>
                                <p className="text-sm text-red-700 mt-1 leading-relaxed">
                                    Are you absolutely sure you want to delete <strong className="font-semibold text-red-900">{deletingOrg?.name}</strong>?
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-5 bg-white">
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
                                <p className="text-sm text-red-800 font-medium mb-1">This action cannot be undone.</p>
                                <p className="text-xs text-red-600/80">
                                    All associated users, tool inventory, and transaction history belonging to this organization will be permanently wiped from the database.
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Please type <strong>DELETE</strong> to confirm.
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="Type DELETE here"
                                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmText(''); }}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={deleting || deleteConfirmText !== 'DELETE'}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiTrash2 className="h-4 w-4" />}
                                    Delete Permanently
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Free Upgrade Modal */}
            {isUpgradeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50">
                            <div className="flex items-center gap-2">
                                <FiStar className="h-5 w-5 text-yellow-600" />
                                <h3 className="text-lg font-bold text-gray-900">Premium Upgrade</h3>
                            </div>
                            <button onClick={() => setIsUpgradeModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Manually grant Premium access to <strong className="text-gray-900">{selectedOrg?.name}</strong>. This bypasses payment processing and grants immediate access.
                                </p>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upgrade Duration</label>
                                <select
                                    value={upgradeDuration}
                                    onChange={(e) => setUpgradeDuration(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                                >
                                    <option value="1_month">1 Month</option>
                                    <option value="1_year">1 Year</option>
                                    <option value="lifetime">Lifetime</option>
                                </select>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsUpgradeModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFreeUpgrade}
                                    disabled={upgrading}
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-xl transition-all shadow-sm disabled:opacity-70"
                                >
                                    {upgrading ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiStar className="h-4 w-4" />}
                                    Confirm Upgrade
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
