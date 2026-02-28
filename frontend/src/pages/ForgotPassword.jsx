import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiArrowLeft, FiShield, FiCheckCircle, FiTool, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Single digit OTP input box
const OtpBox = ({ value, onChange, onKeyDown, inputRef, index }) => (
    <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={value}
        onChange={(e) => onChange(e, index)}
        onKeyDown={(e) => onKeyDown(e, index)}
        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 focus:bg-white"
    />
);

const STEPS = { EMAIL: 0, OTP: 1, PASSWORD: 2, DONE: 3 };

const ForgotPassword = () => {
    const [step, setStep] = useState(STEPS.EMAIL);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const navigate = useNavigate();
    const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

    useEffect(() => { setIsMounted(true); }, []);

    // ─── Step 1: Send OTP ──────────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/auth/forgot-password', { email });
            toast.success('OTP sent! Check your inbox.');
            setStep(STEPS.OTP);
            setTimeout(() => otpRefs.current[0]?.current?.focus(), 100);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // ─── OTP box handlers ───────────────────────────────────────────────
    const handleOtpChange = (e, index) => {
        const val = e.target.value.replace(/\D/g, '');
        if (!val) return;
        const next = [...otp];
        next[index] = val.slice(-1);
        setOtp(next);
        if (index < 5 && val) otpRefs.current[index + 1]?.current?.focus();
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            const next = [...otp];
            if (next[index]) {
                next[index] = '';
                setOtp(next);
            } else if (index > 0) {
                otpRefs.current[index - 1]?.current?.focus();
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpStr = otp.join('');
        if (otpStr.length < 6) { toast.error('Enter all 6 digits'); return; }
        setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/verify-otp', { email, otp: otpStr });
            setResetToken(data.resetToken);
            toast.success('OTP verified!');
            setStep(STEPS.PASSWORD);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // ─── Step 3: Reset Password ─────────────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
        if (newPassword.length < 6) { toast.error('Minimum 6 characters'); return; }
        setLoading(true);
        try {
            await axios.post('/api/auth/reset-password', { email, resetToken, newPassword });
            toast.success('Password reset! Redirecting to login…');
            setStep(STEPS.DONE);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    // ─── Progress bar ───────────────────────────────────────────────────
    const stepLabels = ['Email', 'Verify OTP', 'New Password'];
    const progress = step === STEPS.DONE ? 100 : Math.round((step / 3) * 100);

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
            {/* Particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white/10 animate-pulse"
                        style={{ width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s` }} />
                ))}
            </div>

            <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="mx-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-5 shadow-2xl">
                        <FiShield className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Reset Password</h1>
                    <p className="text-blue-200 mt-2 text-sm">
                        {step === STEPS.EMAIL && 'Enter your email to receive a one-time code'}
                        {step === STEPS.OTP && `We sent a 6-digit OTP to ${email}`}
                        {step === STEPS.PASSWORD && 'Almost there! Set your new password'}
                        {step === STEPS.DONE && 'You\'re all set! Redirecting…'}
                    </p>
                </div>

                {/* Progress */}
                {step < STEPS.DONE && (
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            {stepLabels.map((label, i) => (
                                <span key={i} className={`text-xs font-medium ${i <= step ? 'text-white' : 'text-white/40'}`}>{label}</span>
                            ))}
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {/* Card */}
                <div className="card p-8 bg-white/95 backdrop-blur-xl shadow-2xl">

                    {/* ─ Step 0: Email ─ */}
                    {step === STEPS.EMAIL && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                                    </div>
                                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                        placeholder="you@example.com" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                                {loading ? <><FiRefreshCw className="animate-spin h-4 w-4" /> Sending…</> : <><FiMail className="h-5 w-5" /> Send OTP</>}
                            </button>
                        </form>
                    )}

                    {/* ─ Step 1: OTP ─ */}
                    {step === STEPS.OTP && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="flex gap-2 justify-center">
                                {otp.map((digit, index) => (
                                    <OtpBox key={index} value={digit} onChange={handleOtpChange} onKeyDown={handleOtpKeyDown}
                                        inputRef={otpRefs.current[index]} index={index} />
                                ))}
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                                {loading ? <><FiRefreshCw className="animate-spin h-4 w-4" /> Verifying…</> : <><FiShield className="h-5 w-5" /> Verify OTP</>}
                            </button>
                            <p className="text-center text-sm text-gray-500">
                                Didn't get it?{' '}
                                <button type="button" className="text-blue-600 hover:underline font-medium"
                                    onClick={() => { setStep(STEPS.EMAIL); setOtp(['', '', '', '', '', '']); }}>
                                    Resend OTP
                                </button>
                            </p>
                        </form>
                    )}

                    {/* ─ Step 2: New Password ─ */}
                    {step === STEPS.PASSWORD && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                                    </div>
                                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                        placeholder="Min 6 characters" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                                    </div>
                                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                        placeholder="••••••••" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                                {loading ? <><FiRefreshCw className="animate-spin h-4 w-4" /> Resetting…</> : <><FiLock className="h-5 w-5" /> Reset Password</>}
                            </button>
                        </form>
                    )}

                    {/* ─ Step 3: Done ─ */}
                    {step === STEPS.DONE && (
                        <div className="text-center py-4">
                            <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">Password Reset!</h3>
                            <p className="text-gray-500 mt-2 text-sm">Redirecting you to login…</p>
                        </div>
                    )}
                </div>

                {/* Back to login */}
                <div className="mt-6 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-blue-200 text-sm hover:text-white transition-colors">
                        <FiArrowLeft className="h-4 w-4" /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
