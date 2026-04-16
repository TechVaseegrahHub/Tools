import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiArrowLeft, FiShield, FiCheckCircle, FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';

/* ─── OTP single digit box ─── */
const OtpBox = ({ value, onChange, onKeyDown, inputRef, index }) => (
    <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={value}
        onChange={(e) => onChange(e, index)}
        onKeyDown={(e) => onKeyDown(e, index)}
        className="w-12 h-14 text-center text-2xl font-black border-2 border-black bg-white text-black focus:border-[#ff0000] focus:outline-none transition-colors"
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
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

    useEffect(() => { setIsMounted(true); }, []);

    /* ─ Step 1: Send OTP ─ */
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
        } finally { setLoading(false); }
    };

    /* ─ OTP handlers ─ */
    const handleOtpChange = (e, index) => {
        const val = e.target.value.replace(/\D/g, '');
        if (!val) return;
        const next = [...otp]; next[index] = val.slice(-1); setOtp(next);
        if (index < 5 && val) otpRefs.current[index + 1]?.current?.focus();
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            const next = [...otp];
            if (next[index]) { next[index] = ''; setOtp(next); }
            else if (index > 0) otpRefs.current[index - 1]?.current?.focus();
        }
    };

    /* ─ Step 2: Verify OTP ─ */
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
        } finally { setLoading(false); }
    };

    /* ─ Step 3: Reset Password ─ */
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
        } finally { setLoading(false); }
    };

    const stepLabels = ['Email', 'Verify OTP', 'New Password'];
    const progress = step === STEPS.DONE ? 100 : Math.round((step / 3) * 100);

    return (
        <div className="relative min-h-screen overflow-hidden bg-white flex items-center justify-center p-4">
            {/* Grid background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.05]"
                style={{
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />
            {/* Red diagonal accent */}
            <div className="absolute top-0 right-0 w-[40%] h-full bg-black pointer-events-none" style={{ clipPath: 'polygon(100% 0, 100% 100%, 30% 100%)' }} />

            <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Logo badge */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 mb-6">
                        <FiShield className="h-5 w-5 text-[#ff0000]" />
                        <span className="font-mono text-xs uppercase tracking-[0.3em]">SECURE_RESET</span>
                    </div>
                    <h1 className="text-4xl font-black text-black uppercase tracking-tighter" style={{ fontFamily: 'Syncopate, sans-serif' }}>
                        RESET<br />PASSWORD
                    </h1>
                    <div className="h-[3px] w-16 bg-[#ff0000] mt-3 mb-3" />
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                        {step === STEPS.EMAIL && 'Enter your email to receive a one-time code'}
                        {step === STEPS.OTP && `We sent a 6-digit OTP to ${email}`}
                        {step === STEPS.PASSWORD && 'Almost there! Set your new password'}
                        {step === STEPS.DONE && "You're all set! Redirecting…"}
                    </p>
                </div>

                {/* Progress bar */}
                {step < STEPS.DONE && (
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            {stepLabels.map((label, i) => (
                                <span key={i} className={`text-[9px] font-black uppercase tracking-widest ${i <= step ? 'text-black' : 'text-gray-300'}`}>
                                    {i < step ? '✓ ' : ''}{label}
                                </span>
                            ))}
                        </div>
                        <div className="h-[3px] bg-gray-100 w-full">
                            <div className="h-full bg-[#ff0000] transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {/* Card */}
                <div className="bg-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">

                    {/* ─ Step 0: Email ─ */}
                    {step === STEPS.EMAIL && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 mb-2">Email Address</label>
                                <div className="relative group">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff0000] transition-colors" />
                                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-white border-2 border-black py-4 pl-11 pr-4 text-black placeholder:text-gray-300 font-mono text-sm focus:outline-none focus:border-[#ff0000] transition-colors"
                                        placeholder="you@example.com" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-[#ff0000] text-white font-black py-4 uppercase tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
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
                                className="w-full bg-[#ff0000] text-white font-black py-4 uppercase tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                                {loading ? <><FiRefreshCw className="animate-spin h-4 w-4" /> Verifying…</> : <><FiShield className="h-5 w-5" /> Verify OTP</>}
                            </button>
                            <p className="text-center text-xs font-mono text-gray-400">
                                Didn't get it?{' '}
                                <button type="button" className="text-black font-black hover:text-[#ff0000] transition-colors"
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
                                <label className="block text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 mb-2">New Password</label>
                                <div className="relative group">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff0000] transition-colors" />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        required
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full bg-white border-2 border-black py-4 pl-11 pr-11 text-black placeholder:text-gray-300 font-mono text-sm focus:outline-none focus:border-[#ff0000] transition-colors"
                                        placeholder="Min 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                    >
                                        {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 mb-2">Confirm Password</label>
                                <div className="relative group">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff0000] transition-colors" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white border-2 border-black py-4 pl-11 pr-11 text-black placeholder:text-gray-300 font-mono text-sm focus:outline-none focus:border-[#ff0000] transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                    >
                                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-[#ff0000] text-white font-black py-4 uppercase tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                                {loading ? <><FiRefreshCw className="animate-spin h-4 w-4" /> Resetting…</> : <><FiLock className="h-5 w-5" /> Reset Password</>}
                            </button>
                        </form>
                    )}

                    {/* ─ Step 3: Done ─ */}
                    {step === STEPS.DONE && (
                        <div className="text-center py-8">
                            <div className="inline-flex p-5 bg-[#ff0000] mb-6">
                                <FiCheckCircle className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="text-xl font-black uppercase text-black tracking-tighter">Password Reset!</h3>
                            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2">Redirecting you to login…</p>
                        </div>
                    )}
                </div>

                {/* Back to login */}
                <div className="mt-6 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-gray-400 hover:text-black transition-colors">
                        <FiArrowLeft className="h-3 w-3" /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
