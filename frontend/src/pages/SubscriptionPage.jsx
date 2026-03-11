import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FiZap, FiCalendar, FiCheckCircle, FiXCircle, FiAlertTriangle,
    FiRefreshCw, FiShield, FiClock, FiTrendingUp, FiX, FiUsers, FiGlobe
} from 'react-icons/fi';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';

/* ═══════════════════════════════════════════
   SUPERADMIN VIEW — all orgs subscription stats
═══════════════════════════════════════════ */
const SuperAdminSubscriptionView = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data: res } = await axios.get('/api/superadmin/subscriptions');
            setData(res);
        } catch {
            toast.error('Failed to load subscription statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';

    const statusBadge = (plan, status) => {
        if (plan === 'premium' && status === 'active')
            return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Premium</span>;
        if (status === 'cancelled')
            return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-600">Cancelled</span>;
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">Free</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-xl"><FiGlobe className="h-5 w-5 text-gray-500" /></div>
                    <div>
                        <p className="text-2xl font-black text-gray-800">{data?.summary?.total ?? 0}</p>
                        <p className="text-xs text-gray-400 font-medium">Total Organizations</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl"><FiZap className="h-5 w-5 text-blue-600" /></div>
                    <div>
                        <p className="text-2xl font-black text-blue-700">{data?.summary?.premium ?? 0}</p>
                        <p className="text-xs text-blue-400 font-medium">Premium Plans</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-xl"><FiShield className="h-5 w-5 text-gray-400" /></div>
                    <div>
                        <p className="text-2xl font-black text-gray-600">{data?.summary?.free ?? 0}</p>
                        <p className="text-xs text-gray-400 font-medium">Free Plans</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg"><FiUsers className="h-4 w-4 text-blue-600" /></div>
                        <h2 className="font-semibold text-gray-800">All Organizations</h2>
                    </div>
                    <button onClick={fetchStats} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        <FiRefreshCw className="h-3.5 w-3.5" /> Refresh
                    </button>
                </div>
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold">Organization</th>
                                <th className="px-6 py-3 text-left font-semibold">Plan</th>
                                <th className="px-6 py-3 text-left font-semibold">Renewal / End Date</th>
                                <th className="px-6 py-3 text-left font-semibold">Users</th>
                                <th className="px-6 py-3 text-left font-semibold">Tools</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.orgs?.map(org => (
                                <tr key={org._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-800">{org.name}</p>
                                        <p className="text-xs text-gray-400 font-mono">{org.slug}</p>
                                    </td>
                                    <td className="px-6 py-4">{statusBadge(org.subscriptionPlan, org.subscriptionStatus)}</td>
                                    <td className="px-6 py-4 text-gray-500">{formatDate(org.currentPeriodEnd)}</td>
                                    <td className="px-6 py-4 text-gray-600">{org.stats?.users ?? 0}</td>
                                    <td className="px-6 py-4 text-gray-600">{org.stats?.tools ?? 0}</td>
                                </tr>
                            ))}
                            {(!data?.orgs || data.orgs.length === 0) && (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No organizations found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-gray-100">
                    {data?.orgs?.map(org => (
                        <div key={org._id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm">{org.name}</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{org.slug}</p>
                                </div>
                                <div>{statusBadge(org.subscriptionPlan, org.subscriptionStatus)}</div>
                            </div>

                            <div className="space-y-2 mb-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Renewal / End</span>
                                    <span className="text-gray-900 text-xs font-semibold">{formatDate(org.currentPeriodEnd)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Users</span>
                                    <span className="text-gray-900 text-xs">{org.stats?.users ?? 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Tools</span>
                                    <span className="text-gray-900 text-xs">{org.stats?.tools ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!data?.orgs || data.orgs.length === 0) && (
                        <div className="p-8 text-center text-gray-400">
                            No organizations found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   ADMIN VIEW — own org subscription details
═══════════════════════════════════════════ */
const AdminSubscriptionView = () => {
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const fetchOrg = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/org/settings');
            setOrg(data);
        } catch {
            toast.error('Failed to load subscription details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrg(); }, []);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await axios.delete('/api/org/subscription');
            toast.success('Subscription cancelled. You retain access until the period ends.');
            setShowCancelConfirm(false);
            fetchOrg();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel subscription');
        } finally {
            setCancelling(false);
        }
    };

    const isPremium = (org?.subscriptionPlan === 'premium' || org?.subscriptionPlan === 'free_premium') && org?.subscriptionStatus === 'active';
    const isFreePremium = org?.subscriptionPlan === 'free_premium' && org?.subscriptionStatus === 'active';
    const isCancelled = org?.subscriptionStatus === 'cancelled';
    const daysRemaining = org?.currentPeriodEnd
        ? Math.max(0, Math.ceil((new Date(org.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24)))
        : null;
    const cycleLength = daysRemaining !== null ? Math.max(daysRemaining, 28) : 30;
    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

    const statusConfig = {
        active: { label: 'Active', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: FiCheckCircle },
        cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: FiXCircle },
        halted: { label: 'Halted', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: FiAlertTriangle },
        created: { label: 'Pending', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: FiClock },
    };
    const status = statusConfig[org?.subscriptionStatus] || statusConfig.active;
    const StatusIcon = status.icon;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* ── Plan Banner ── */}
            <div className={`rounded-2xl border overflow-hidden ${isPremium ? 'border-blue-200 shadow-blue-100 shadow-md' : 'border-gray-200 shadow-sm'}`}>
                <div className={`px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isPremium ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'}`}>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            {isPremium ? <FiZap className="h-7 w-7 text-white" /> : <FiShield className="h-7 w-7 text-white" />}
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Current Plan</p>
                            <h2 className="text-white text-2xl font-black">{isFreePremium ? 'Free Premium' : isPremium ? 'Premium' : 'Free'} Plan</h2>
                            <p className="text-white/70 text-sm mt-0.5">
                                {isFreePremium ? 'Manually granted — unlimited tools' : isPremium ? '₹99 / month — billed monthly' : 'Free forever — up to 10 tools'}
                            </p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${status.bg} ${status.color} border ${status.border}`}>
                        <StatusIcon className="h-4 w-4" />
                        {status.label}
                    </div>
                </div>
                {isPremium && daysRemaining !== null && (
                    <div className="bg-white px-8 py-3 border-t border-blue-100">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                            <span className="font-medium">Billing cycle progress</span>
                            <span>{daysRemaining} of {cycleLength} days remaining</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (daysRemaining / cycleLength) * 100)}%` }} />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Stats Row ── */}
            {isPremium ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-blue-100 rounded-2xl p-5 text-center shadow-sm">
                        <FiClock className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                        <p className="text-3xl font-black text-blue-700">{daysRemaining ?? '—'}</p>
                        <p className="text-xs text-blue-400 font-semibold mt-1">of {cycleLength} days</p>
                    </div>
                    <div className="bg-white border border-indigo-100 rounded-2xl p-5 text-center shadow-sm">
                        <FiCalendar className="h-5 w-5 text-indigo-500 mx-auto mb-2" />
                        <p className="text-sm font-black text-indigo-700 leading-tight">{formatDate(org?.currentPeriodEnd)}</p>
                        <p className="text-xs text-indigo-400 font-semibold mt-1">{isCancelled ? 'Access Ends' : 'Next Renewal'}</p>
                    </div>
                    <div className="bg-white border border-green-100 rounded-2xl p-5 text-center shadow-sm">
                        <FiTrendingUp className="h-5 w-5 text-green-500 mx-auto mb-2" />
                        <p className="text-3xl font-black text-green-700">{isFreePremium ? '₹0' : '₹99'}</p>
                        <p className="text-xs text-green-400 font-semibold mt-1">Monthly Charge</p>
                    </div>
                    <div className="bg-white border border-purple-100 rounded-2xl p-5 text-center shadow-sm">
                        <FiZap className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                        <p className="text-3xl font-black text-purple-700">∞</p>
                        <p className="text-xs text-purple-400 font-semibold mt-1">Tool Limit</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
                        <FiShield className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                        <p className="text-3xl font-black text-gray-700">10</p>
                        <p className="text-xs text-gray-400 font-semibold mt-1">Tool Limit</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
                        <FiTrendingUp className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                        <p className="text-3xl font-black text-gray-700">₹0</p>
                        <p className="text-xs text-gray-400 font-semibold mt-1">Monthly Charge</p>
                    </div>
                    <div className="bg-white border border-blue-100 rounded-2xl p-5 text-center shadow-sm col-span-2 sm:col-span-1">
                        <FiZap className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-black text-blue-700">Upgrade Available</p>
                        <p className="text-xs text-blue-400 font-semibold mt-1">₹99/month</p>
                    </div>
                </div>
            )}

            {/* ── Detail Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Plan Features */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isPremium ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <FiZap className={`h-4 w-4 ${isPremium ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <h3 className="font-semibold text-gray-800">Plan Features</h3>
                    </div>
                    <div className="p-6 space-y-1">
                        {[
                            { label: 'Tool Inventory Limit', free: 'Up to 10 tools', premium: 'Unlimited tools' },
                            { label: 'User Accounts', free: 'Unlimited', premium: 'Unlimited' },
                            { label: 'Transactions', free: 'Unlimited', premium: 'Unlimited' },
                            { label: 'Reports & Analytics', free: 'Basic', premium: 'Full access' },
                            { label: 'Priority Support', free: '—', premium: '✓ Included' },
                            { label: 'Data Exports', free: '—', premium: '✓ Included' },
                        ].map(({ label, free, premium: prem }) => (
                            <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                                <span className="text-sm text-gray-600 font-medium">{label}</span>
                                <span className={`text-sm font-semibold ${isPremium ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {isPremium ? prem : free}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Billing Details */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <FiCalendar className="h-4 w-4 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Billing Details</h3>
                    </div>
                    <div className="p-6 space-y-1">
                        {[
                            { label: 'Plan', value: isFreePremium ? 'Free Premium' : isPremium ? 'Premium' : 'Free' },
                            { label: 'Billing Cycle', value: isFreePremium ? '—' : isPremium ? 'Monthly' : '—' },
                            { label: 'Amount', value: isFreePremium ? '₹0' : isPremium ? '₹99 / month' : '₹0' },
                            { label: isCancelled ? 'Access Ends' : 'Next Renewal', value: formatDate(org?.currentPeriodEnd) },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                                <span className="text-sm text-gray-500">{label}</span>
                                <span className="text-sm font-semibold text-gray-800">{value}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Status</span>
                            <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color} border ${status.border}`}>
                                <StatusIcon className="h-3 w-3" />{status.label}
                            </div>
                        </div>
                        {org?.razorpaySubscriptionId && (
                            <div className="flex justify-between items-start py-2.5">
                                <span className="text-sm text-gray-500">Subscription ID</span>
                                <span className="text-xs font-mono text-gray-600 text-right max-w-[55%] break-all">{org.razorpaySubscriptionId}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Organization Info ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                        <FiGlobe className="h-4 w-4 text-gray-500" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Organization</h3>
                </div>
                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Name</p>
                        <p className="font-semibold text-gray-800">{org?.name || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Slug</p>
                        <p className="font-mono text-sm text-gray-600">{org?.slug || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Member Since</p>
                        <p className="font-semibold text-gray-800">{formatDate(org?.createdAt)}</p>
                    </div>
                    {isPremium && org?.currentPeriodEnd && (
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Subscribed On</p>
                            <p className="font-semibold text-gray-800">
                                {formatDate(new Date(new Date(org.currentPeriodEnd).getTime() - cycleLength * 24 * 60 * 60 * 1000))}
                            </p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Account Status</p>
                        <p className={`font-semibold ${org?.isActive ? 'text-green-600' : 'text-red-500'}`}>
                            {org?.isActive ? 'Active' : 'Inactive'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex flex-wrap gap-3">
                {!isPremium && (
                    <button onClick={() => setShowUpgrade(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <FiZap className="h-4 w-4" /> Upgrade to Premium — ₹99/month
                    </button>
                )}
                {isPremium && !isCancelled && !isFreePremium && (
                    <button onClick={() => setShowCancelConfirm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all">
                        <FiXCircle className="h-4 w-4" /> Cancel Subscription
                    </button>
                )}
                <button onClick={fetchOrg}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all">
                    <FiRefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {/* Cancel Confirm Modal */}
            {
                showCancelConfirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-red-100 p-2.5 rounded-xl"><FiAlertTriangle className="h-5 w-5 text-red-600" /></div>
                                <button onClick={() => setShowCancelConfirm(false)} className="text-gray-400 hover:text-gray-600"><FiX className="h-5 w-5" /></button>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Subscription?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                You'll retain Premium access until <strong>{formatDate(org?.currentPeriodEnd)}</strong>. After that, your account reverts to the Free plan (10 tool limit).
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowCancelConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">
                                    Keep Plan
                                </button>
                                <button onClick={handleCancel} disabled={cancelling} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-60">
                                    {cancelling ? <FiRefreshCw className="animate-spin h-4 w-4" /> : null}
                                    {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} onSuccess={() => { setShowUpgrade(false); fetchOrg(); }} />
        </div>
    );
};

/* ═══════════════════════════════════════════
   ROOT — picks correct view by role
═══════════════════════════════════════════ */
const SubscriptionPage = () => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'SuperAdmin';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {isSuperAdmin ? 'Overview of all organization subscription plans' : 'Manage your plan and billing details'}
                </p>
            </div>
            {isSuperAdmin ? <SuperAdminSubscriptionView /> : <AdminSubscriptionView />}
        </div>
    );
};

export default SubscriptionPage;
