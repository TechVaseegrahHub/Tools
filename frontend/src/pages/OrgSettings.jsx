import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    FiGlobe, FiLock, FiSave, FiCheckCircle, FiRefreshCw, FiInfo,
    FiStar, FiZap, FiShield, FiClock, FiAlertTriangle, FiX, FiArrowRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

/* ─── helpers ─────────────────────────────────────────── */
const daysRemaining = (endDate) => {
    if (!endDate) return 0;
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/* ─── Status badge ────────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const map = {
        active: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
        halted: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Halted' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500', label: 'Cancelled' },
        created: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Pending' },
    };
    const s = map[status] || map.active;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
            {s.label}
        </span>
    );
};

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
                <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
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

/* ─── Cancel confirmation modal ─────────────────────────── */
const CancelModal = ({ onConfirm, onClose, loading }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex items-start gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                    <FiAlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Cancel Subscription?</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Your premium access will be revoked immediately. This action cannot be undone.
                    </p>
                </div>
            </div>
            <div className="flex gap-3 mt-5">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                >
                    Keep Plan
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {loading ? <FiRefreshCw className="animate-spin h-4 w-4" /> : <FiX className="h-4 w-4" />}
                    {loading ? 'Cancelling…' : 'Yes, Cancel'}
                </button>
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════ */
const OrgSettings = () => {
    const { user } = useAuth();

    /* Org Info */
    const [orgName, setOrgName] = useState('');
    const [orgSlug, setOrgSlug] = useState('');
    const [orgLoading, setOrgLoading] = useState(true);
    const [orgSaving, setOrgSaving] = useState(false);

    /* Change Password */
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving, setPwSaving] = useState(false);

    /* Subscription */
    const [subPlan, setSubPlan] = useState('free');
    const [subStatus, setSubStatus] = useState('active');
    const [periodEnd, setPeriodEnd] = useState(null);
    const [subId, setSubId] = useState(null);
    const [showCancel, setShowCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [upgrading, setUpgrading] = useState(false);

    /* ── Load org settings ── */
    const fetchOrg = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/org/settings');
            setOrgName(data.name);
            setOrgSlug(data.slug);
            setSubPlan(data.subscriptionPlan || 'free');
            setSubStatus(data.subscriptionStatus || 'active');
            setPeriodEnd(data.currentPeriodEnd || null);
            setSubId(data.razorpaySubscriptionId || null);
        } catch {
            toast.error('Failed to load org settings');
        } finally {
            setOrgLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrg(); }, [fetchOrg]);

    /* ── Org save ── */
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

    /* ── Password change ── */
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

    /* ── Upgrade → Razorpay ── */
    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            const { data } = await axios.post('/api/payment/create-subscription');
            const { subscriptionId, keyId } = data;

            const options = {
                key: keyId,
                subscription_id: subscriptionId,
                name: 'ToolRoom Premium',
                description: 'Monthly Premium Plan',
                image: '/logo.png',
                handler: async function (response) {
                    try {
                        await axios.post('/api/payment/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        toast.success('🎉 Welcome to Premium!');
                        // Immediately update local state so the card flips to premium view
                        setSubPlan('premium');
                        setSubStatus('active');
                        const end = new Date();
                        end.setMonth(end.getMonth() + 1);
                        setPeriodEnd(end.toISOString());
                        setSubId(response.razorpay_subscription_id);
                    } catch {
                        toast.error('Payment verification failed. Contact support.');
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                },
                theme: { color: '#4f46e5' },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'));
            rzp.open();
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not initiate payment';
            // If backend says already premium, just refresh to show the premium view
            if (err.response?.status === 400 && msg.toLowerCase().includes('premium')) {
                toast.info('You already have an active premium subscription.');
                fetchOrg();
            } else {
                toast.error(msg);
            }
        } finally {
            setUpgrading(false);
        }
    };

    /* ── Cancel subscription ── */
    const handleCancelConfirm = async () => {
        setCancelling(true);
        try {
            await axios.delete('/api/org/subscription');
            toast.success('Subscription cancelled.');
            setShowCancel(false);
            fetchOrg();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cancellation failed');
        } finally {
            setCancelling(false);
        }
    };

    const days = daysRemaining(periodEnd);
    const isPremium = subPlan === 'premium';

    return (
        <div className="space-y-6 w-full">
            {showCancel && (
                <CancelModal
                    onConfirm={handleCancelConfirm}
                    onClose={() => setShowCancel(false)}
                    loading={cancelling}
                />
            )}

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

            {/* ─── Subscription Card ─── */}
            <div className={`rounded-2xl shadow-sm border overflow-hidden ${isPremium
                ? 'bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 border-purple-700'
                : 'bg-white border-gray-100'}`}>

                {/* Card header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${isPremium ? 'border-purple-700/50' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isPremium ? 'bg-yellow-400/20' : 'bg-amber-100'}`}>
                            <FiStar className={`h-5 w-5 ${isPremium ? 'text-yellow-400' : 'text-amber-500'}`} />
                        </div>
                        <div>
                            <h2 className={`font-semibold ${isPremium ? 'text-white' : 'text-gray-800'}`}>Subscription Plan</h2>
                            <p className={`text-xs ${isPremium ? 'text-purple-300' : 'text-gray-500'}`}>
                                {isPremium ? 'Premium — All features unlocked' : 'Manage your ToolRoom subscription'}
                            </p>
                        </div>
                    </div>
                    {isPremium && <StatusBadge status={subStatus} />}
                </div>

                {/* ── FREE: Upgrade CTA ── */}
                {!isPremium && (
                    <div className="p-6">
                        {/* Feature highlights */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[
                                { icon: FiZap, color: 'text-amber-500 bg-amber-50', label: 'Unlimited Tools' },
                                { icon: FiShield, color: 'text-emerald-500 bg-emerald-50', label: 'Priority Support' },
                                { icon: FiClock, color: 'text-blue-500 bg-blue-50', label: 'Full Reports' },
                            ].map(({ icon: Icon, color, label }) => (
                                <div key={label} className="flex flex-col items-center text-center bg-gray-50 rounded-xl p-3 gap-2">
                                    <div className={`p-2 rounded-lg ${color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-600">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Pricing */}
                        <div className="relative bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 rounded-xl p-5 mb-5 overflow-hidden">
                            {/* decorative blobs */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-400/20 rounded-full blur-2xl" />
                            <div className="relative z-10">
                                <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">Premium Plan</p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-white text-3xl font-bold">₹1</span>
                                    <span className="text-purple-300 text-sm">/ month</span>
                                </div>
                                <p className="text-purple-200 text-xs">Billed monthly · Cancel anytime</p>
                            </div>
                        </div>

                        <button
                            onClick={handleUpgrade}
                            disabled={upgrading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-60"
                        >
                            {upgrading
                                ? <><FiRefreshCw className="animate-spin h-4 w-4" /> Processing…</>
                                : <><FiZap className="h-4 w-4" /> Upgrade to Premium <FiArrowRight className="h-4 w-4" /></>
                            }
                        </button>
                    </div>
                )}

                {/* ── PREMIUM: Details view ── */}
                {isPremium && (
                    <div className="p-6 space-y-5">
                        {/* Ring + title */}
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center gap-1">
                                <DaysRing days={days} max={31} />
                                <p className="text-purple-300 text-[10px] font-semibold uppercase tracking-wide">days left</p>
                            </div>
                            <div>
                                <p className="text-white text-lg font-bold">Premium Plan</p>
                                <p className="text-purple-300 text-xs mt-0.5">
                                    {days > 0
                                        ? `${days} day${days !== 1 ? 's' : ''} remaining · renews ${fmtDate(periodEnd)}`
                                        : <span className="text-red-400">Subscription expires today</span>
                                    }
                                </p>
                            </div>
                        </div>

                        {/* 6-stat grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { label: 'Plan', value: 'Premium ✦' },
                                { label: 'Status', value: subStatus ? subStatus.charAt(0).toUpperCase() + subStatus.slice(1) : '—' },
                                { label: 'Days Used', value: periodEnd ? `${30 - days} / 30` : '—' },
                                { label: 'Subscribed On', value: periodEnd ? fmtDate(new Date(new Date(periodEnd).getTime() - 30 * 24 * 60 * 60 * 1000)) : '—' },
                                { label: 'Expires On', value: fmtDate(periodEnd) },
                                { label: 'Subscription ID', value: subId ? subId.slice(0, 14) + '…' : '—', mono: true },
                            ].map(({ label, value, mono }) => (
                                <div key={label} className="bg-white/10 rounded-xl px-3 py-3">
                                    <p className="text-purple-300 text-[10px] uppercase tracking-wide font-semibold mb-0.5">{label}</p>
                                    <p className={`text-white font-semibold mt-0.5 ${mono ? 'font-mono text-xs' : 'text-sm'}`}>{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-purple-700/40" />

                        {/* Premium perks */}
                        <div className="grid grid-cols-3 gap-2">
                            {['Unlimited Tools', 'Full Reports', 'Priority Support'].map(perk => (
                                <div key={perk} className="flex items-center gap-1.5 text-xs text-purple-200">
                                    <FiCheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    {perk}
                                </div>
                            ))}
                        </div>

                        {/* Cancel link */}
                        <div className="pt-1 text-right">
                            <button
                                onClick={() => setShowCancel(true)}
                                className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
                            >
                                Cancel subscription
                            </button>
                        </div>
                    </div>
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

            {/* Account info (read-only) */}
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
