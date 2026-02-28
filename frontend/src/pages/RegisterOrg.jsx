import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiTool, FiSettings, FiZap, FiShield, FiMail, FiLock, FiUser, FiGlobe, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const FloatingElement = ({ icon: Icon, delay, position, size = 'md' }) => {
    const sizeClasses = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
    const positions = {
        'top-left': 'top-20 left-10', 'top-right': 'top-16 right-16',
        'bottom-left': 'bottom-24 left-12', 'bottom-right': 'bottom-20 right-20',
        'center-left': 'top-1/2 left-8', 'center-right': 'top-1/3 right-12'
    };
    return (
        <div className={`absolute ${positions[position]} ${sizeClasses[size]} animate-float`}
            style={{ animationDelay: `${delay}s`, animationDuration: `${3 + delay}s` }}>
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20 shadow-lg">
                <Icon className="text-white/80 w-full h-full" />
            </div>
        </div>
    );
};

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
            // Store token and redirect to dashboard
            localStorage.setItem('token', data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            setSuccess(true);
            toast.success(`Welcome to ToolRoom, ${data.org?.name}!`);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
            {/* Background */}
            <div className="absolute inset-0">
                <FloatingElement icon={FiSettings} delay={0} position="top-left" size="sm" />
                <FloatingElement icon={FiZap} delay={0.5} position="top-right" size="md" />
                <FloatingElement icon={FiShield} delay={1} position="bottom-left" size="sm" />
                <FloatingElement icon={FiTool} delay={1.5} position="bottom-right" size="lg" />
                <FloatingElement icon={FiGlobe} delay={2} position="center-left" size="sm" />
                <FloatingElement icon={FiZap} delay={2.5} position="center-right" size="md" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute rounded-full bg-white/10 animate-pulse"
                            style={{ width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${10 + Math.random() * 10}s` }} />
                    ))}
                </div>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className={`w-full max-w-lg transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="mx-auto bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 shadow-2xl">
                            <FiGlobe className="h-10 w-10" />
                        </div>
                        <h1 className="text-4xl font-bold text-white drop-shadow-lg">Register your Organisation</h1>
                        <p className="text-emerald-200 text-lg mt-2">Get started with ToolRoom in minutes</p>
                        <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 mx-auto rounded-full mt-4" />
                    </div>

                    {/* Form Card */}
                    {success ? (
                        <div className="card p-10 bg-white/95 backdrop-blur-xl text-center">
                            <div className="text-emerald-500 flex justify-center mb-4">
                                <FiCheckCircle className="h-16 w-16" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">All set! 🎉</h2>
                            <p className="text-gray-500">Redirecting to your dashboard…</p>
                        </div>
                    ) : (
                        <div className="card p-8 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                            <form className="space-y-5" onSubmit={handleSubmit}>

                                {/* Org Name */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Organization Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiGlobe className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500" />
                                        </div>
                                        <input name="orgName" type="text" required value={form.orgName} onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                            placeholder="Acme Corp" />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Admin Account</div>

                                {/* Admin Name */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Your Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500" />
                                        </div>
                                        <input name="adminName" type="text" required value={form.adminName} onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                            placeholder="John Doe" />
                                    </div>
                                </div>

                                {/* Admin Email */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Email address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500" />
                                        </div>
                                        <input name="adminEmail" type="email" required value={form.adminEmail} onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                            placeholder="admin@acmecorp.com" />
                                    </div>
                                </div>

                                {/* Password row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500" />
                                            </div>
                                            <input name="adminPassword" type="password" required value={form.adminPassword} onChange={handleChange}
                                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Confirm</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500" />
                                            </div>
                                            <input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange}
                                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button type="submit" disabled={loading}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-2">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Creating your workspace…
                                        </>
                                    ) : (
                                        <><FiCheckCircle className="h-5 w-5" /> Create Organisation</>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Back to login */}
                    <div className="mt-6 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-emerald-200 text-sm hover:text-white transition-colors">
                            <FiArrowLeft className="h-4 w-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterOrg;
