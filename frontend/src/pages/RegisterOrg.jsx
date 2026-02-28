import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiUser, FiGlobe, FiArrowLeft, FiCheckCircle, FiTool, FiShield } from 'react-icons/fi';
import { GiGears, GiSpanner, GiScrew } from 'react-icons/gi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const RegisterOrg = () => {
    const [form, setForm] = useState({ orgName: '', adminName: '', adminEmail: '', adminPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => { setIsMounted(true); }, []);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.adminPassword !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (form.adminPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/register-org', {
                orgName: form.orgName,
                adminName: form.adminName,
                adminEmail: form.adminEmail,
                adminPassword: form.adminPassword,
            });
            localStorage.setItem('token', data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            setSuccess(true);
            toast.success(`Welcome to Aayudha, ${data.org?.name}!`);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0f172a] overflow-hidden selection:bg-emerald-500/30">
            {/* Left Side: Animated Graphics */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 bg-gradient-to-br from-[#064e3b] via-[#0f172a] to-slate-900 border-r border-white/5">

                <div className="absolute top-10 left-10 text-emerald-500/5 animate-gear">
                    <GiGears size={220} />
                </div>
                <div className="absolute bottom-10 right-10 text-emerald-500/5 animate-gear" style={{ animationDirection: 'reverse' }}>
                    <GiGears size={180} />
                </div>

                <div className="relative z-10 w-full max-w-lg">
                    <div className="relative h-96 flex items-center justify-center">
                        <div className="absolute text-emerald-500/10 animate-gear">
                            <GiGears size={340} />
                        </div>
                        <div className="absolute top-1/4 right-0 animate-spanner text-emerald-400/60">
                            <GiSpanner size={90} />
                        </div>
                        <div className="absolute bottom-0 left-10 animate-screw text-slate-400/40">
                            <GiScrew size={70} />
                        </div>
                        <div className="p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl text-center">
                            <FiShield className="mx-auto text-emerald-500 mb-4 h-12 w-12 animate-pulse" />
                            <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Protocol Setup</h2>
                            <div className="h-1.5 w-32 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mx-auto" />
                            <p className="mt-4 text-emerald-300/60 font-medium tracking-widest text-[10px]">Initialize Enterprise Workspace</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center max-w-sm">
                    <h3 className="text-white text-xl font-semibold mb-3">Scale Your Operations</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Deploy your dedicated tool management node in seconds. Professional-grade infrastructure for modern teams.
                    </p>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full lg:w-1/2 flex items-stretch justify-center p-6 sm:p-12 relative overflow-y-auto">
                <div className="lg:hidden absolute inset-0 -z-10 opacity-5">
                    <GiGears className="absolute top-0 right-0 animate-gear" size={400} />
                </div>

                <div className={`w-full max-w-md my-auto transition-all duration-1000 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="mb-8 lg:hidden text-center">
                        <h1 className="text-3xl font-bold text-white tracking-tight italic">AAYUDHA</h1>
                    </div>

                    <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">New Workspace</h2>
                            <p className="text-slate-400 text-sm">Register your organization to begin</p>
                        </div>

                        {success ? (
                            <div className="py-12 text-center">
                                <div className="inline-flex p-5 bg-emerald-500/20 rounded-full mb-6 text-emerald-500">
                                    <FiCheckCircle size={48} className="animate-bounce" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Workspace Created</h3>
                                <p className="text-slate-400">Initializing your dashboard...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em] pl-1">Organization Identity</label>
                                    <div className="relative group">
                                        <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            name="orgName"
                                            type="text"
                                            required
                                            value={form.orgName}
                                            onChange={handleChange}
                                            className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                                            placeholder="Global Tooling Ltd"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-white/5 my-6" />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Admin Credentials</label>
                                    <div className="relative group">
                                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            name="adminName"
                                            type="text"
                                            required
                                            value={form.adminName}
                                            onChange={handleChange}
                                            className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        name="adminEmail"
                                        type="email"
                                        required
                                        value={form.adminEmail}
                                        onChange={handleChange}
                                        className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                                        placeholder="Authorized Email"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            name="adminPassword"
                                            type="password"
                                            required
                                            value={form.adminPassword}
                                            onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                                            className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                                            placeholder="Keys"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={form.confirmPassword}
                                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                            className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                                            placeholder="Verify"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-3 tracking-widest text-xs"
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>INITIALIZE ACCOUNT <FiCheckCircle /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            <FiArrowLeft /> Back to Command Center
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterOrg;
