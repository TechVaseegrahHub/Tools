import React, { useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, useMotionValue, useTransform, useSpring, useScroll, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiGlobe, FiArrowLeft, FiCheckCircle, FiArrowRight, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

/* ─── raw grid overlay ─── */
const GridBg = () => (
    <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
            backgroundImage:
                'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '40px 40px',
        }}
    />
);

/* ─── parallax shapes for left panel ─── */
const FloatingShapes = ({ mouseX, mouseY }) => {
    const shapes = [
        { size: 160, x: '5%', y: '8%', color: '#ff0000', opacity: 0.10, depth: 0.04 },
        { size: 80, x: '72%', y: '15%', color: '#ffffff', opacity: 0.06, depth: 0.07 },
        { size: 55, x: '50%', y: '60%', color: '#ff0000', opacity: 0.22, depth: 0.10 },
        { size: 120, x: '10%', y: '70%', color: '#ffffff', opacity: 0.05, depth: 0.05 },
        { size: 65, x: '78%', y: '80%', color: '#ff0000', opacity: 0.18, depth: 0.08 },
        { size: 210, x: '38%', y: '35%', color: '#ffffff', opacity: 0.03, depth: 0.02 },
    ];
    return (
        <>
            {shapes.map((s, i) => {
                const tx = useTransform(mouseX, [-1, 1], [-s.size * s.depth * 2, s.size * s.depth * 2]);
                const ty = useTransform(mouseY, [-1, 1], [-s.size * s.depth * 2, s.size * s.depth * 2]);
                const sx = useSpring(tx, { stiffness: 50, damping: 15 });
                const sy = useSpring(ty, { stiffness: 50, damping: 15 });
                return (
                    <motion.div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: s.x, top: s.y,
                            width: s.size, height: s.size,
                            background: s.color,
                            opacity: s.opacity,
                            x: sx, y: sy,
                        }}
                    />
                );
            })}
        </>
    );
};

/* ─── field wrapper ─── */
const Field = ({ icon: Icon, label, extra, type, ...inputProps }) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';

    return (
        <div>
            {(label || extra) && (
                <div className="flex justify-between items-center mb-2">
                    {label && (
                        <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">
                            {label}
                        </label>
                    )}
                    {extra}
                </div>
            )}
            <div className="relative group">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff0000] transition-colors" size={16} />
                <input
                    {...inputProps}
                    type={isPassword ? (show ? 'text' : 'password') : type}
                    className="w-full bg-white border-2 border-black py-3.5 pl-11 pr-11 text-black placeholder:text-gray-300 font-mono text-sm focus:outline-none focus:border-[#ff0000] transition-colors"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    >
                        {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
};

const RegisterOrg = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, loginWithGoogle, googleRegisterOrg: registerWithGoogle } = useAuth();
    const googleUser = location.state?.googleUser;

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeGoogleUser, setActiveGoogleUser] = useState(null);

    const [form, setForm] = useState({
        orgName: '',
        adminName: googleUser?.name || '',
        adminEmail: googleUser?.email || '',
        adminPassword: '',
        confirmPassword: '',
        whatsappNumber: '',
    });

    const containerRef = useRef(null);
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);

    const handleMouseMove = (e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        rawX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
        rawY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const { scrollY } = useScroll();
    const panelY = useTransform(scrollY, [0, 400], [0, 60]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const result = await loginWithGoogle(credentialResponse.credential);
            if (result?.newUser) {
                // New user - pre-fill form
                setForm({
                    orgName: '',
                    adminName: result.name || '',
                    adminEmail: result.email || '',
                    adminPassword: '',
                    confirmPassword: '',
                });
                setActiveGoogleUser({ idToken: credentialResponse.credential, ...result });
                toast.success('Google account linked! Now set your workspace and WhatsApp number.');
            } else if (result?.role === 'SuperAdmin') {
                navigate('/superadmin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            // Error already toasted by AuthContext
        } finally {
            setLoading(false);
        }
    };

    const finalGoogleUser = googleUser || activeGoogleUser;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.adminPassword !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (form.adminPassword && form.adminPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        // WhatsApp Validation (India: 10 digits)
        const cleanPhone = form.whatsappNumber.replace(/\D/g, '');
        if (!cleanPhone || cleanPhone.length !== 10) {
            toast.error('Please enter a valid 10-digit WhatsApp number');
            return;
        }

        const formattedPhone = `+91${cleanPhone}`;

        setLoading(true);
        try {
            let data;
            if (finalGoogleUser) {
                data = await registerWithGoogle(finalGoogleUser.idToken, form.orgName, form.adminPassword, formattedPhone);
            } else {
                if (!form.adminPassword) {
                    toast.error('Password is required');
                    setLoading(false);
                    return;
                }
                const res = await axios.post('/api/auth/register-org', {
                    orgName: form.orgName,
                    adminName: form.adminName,
                    adminEmail: form.adminEmail,
                    adminPassword: form.adminPassword,
                    whatsappNumber: formattedPhone,
                });
                data = res.data;
                localStorage.setItem('token', data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }

            setSuccess(true);
            toast.success(`Welcome to Tools App, ${data.org?.name}!`);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="min-h-screen flex bg-white overflow-hidden"
        >
            {/* ════════════════════════════════════
          LEFT — parallax black branding panel
      ════════════════════════════════════ */}
            <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-black border-r-4 border-black">
                <GridBg />
                <FloatingShapes mouseX={rawX} mouseY={rawY} />

                {/* Red diagonal slash */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute bg-[#ff0000]"
                        style={{ width: '3px', height: '160%', top: '-30%', left: '55%', transform: 'rotate(18deg)', opacity: 0.15 }}
                    />
                    <div
                        className="absolute bg-[#ff0000]"
                        style={{ width: '3px', height: '160%', top: '-30%', left: '58%', transform: 'rotate(18deg)', opacity: 0.08 }}
                    />
                </div>

                <motion.div
                    style={{ y: panelY }}
                    className="relative z-10 flex flex-col justify-center p-16 h-full"
                >
                    {/* Protocol badge */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        className="inline-flex items-center gap-2 border-2 border-[#ff0000] px-4 py-1 mb-12 w-fit"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#ff0000] animate-pulse" />
                        <span className="text-[#ff0000] font-mono text-[10px] uppercase tracking-[0.3em] font-black">
                            INIT_PROTOCOL / V2.0
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-white font-black uppercase leading-[0.88] tracking-tighter mb-8"
                        style={{ fontFamily: 'Syncopate, sans-serif', fontSize: 'clamp(2.5rem, 4.5vw, 5rem)' }}
                    >
                        NEW
                        <br />
                        WORK
                        <br />
                        <span style={{ WebkitTextStroke: '2px #ff0000', color: 'transparent' }}>SPACE.</span>
                    </motion.h1>

                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="h-[3px] w-24 bg-[#ff0000] origin-left mb-8"
                    />

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="text-white/40 font-mono text-xs uppercase tracking-[0.2em] leading-relaxed max-w-xs border-l-2 border-white/10 pl-4"
                    >
                        DEPLOY YOUR DEDICATED TOOL MANAGEMENT NODE IN SECONDS.
                        PROFESSIONAL-GRADE INFRASTRUCTURE FOR MODERN TEAMS.
                    </motion.p>

                    {/* Feature ticks */}
                    <div className="mt-12 space-y-3">
                        {['Unlimited Tool Tracking', 'Team Role Management', 'Real-time Analytics', 'Checkout Workflows'].map((f, i) => (
                            <motion.div
                                key={f}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-4 h-4 bg-[#ff0000] flex items-center justify-center flex-shrink-0">
                                    <FiCheckCircle size={10} className="text-white" />
                                </div>
                                <span className="text-white/50 font-mono text-[10px] uppercase tracking-widest">{f}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ════════════════════════════════════
          RIGHT — register form (white)
      ════════════════════════════════════ */}
            <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-10 bg-white relative overflow-y-auto">
                <GridBg />

                {/* Mobile logo */}
                <div className="lg:hidden absolute top-6 left-6">
                    <span className="font-black text-xl uppercase tracking-tighter" style={{ fontFamily: 'Syncopate, sans-serif' }}>
                        TOOLS APP
                    </span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="w-full max-w-md my-auto relative z-10 pt-16 lg:pt-0"
                >
                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 font-mono text-[9px] uppercase tracking-widest mb-4">
                            <span className="w-1.5 h-1.5 bg-[#ff0000] rounded-full animate-pulse" />
                            NEW_WORKSPACE
                        </div>
                        <h2
                            className="text-4xl font-black uppercase text-black tracking-tighter leading-tight"
                            style={{ fontFamily: 'Syncopate, sans-serif' }}
                        >
                            REGISTER
                        </h2>
                        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-2">
                            Initialize your organization workspace
                        </p>
                    </div>

                    {success ? (
                        /* ── Success state ── */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-16 text-center border-2 border-black"
                        >
                            <div className="inline-flex p-5 bg-[#ff0000] mb-6">
                                <FiCheckCircle size={40} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2" style={{ fontFamily: 'Syncopate, sans-serif' }}>
                                WORKSPACE
                                <br />CREATED
                            </h3>
                            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2">Initializing your dashboard...</p>
                        </motion.div>
                    ) : (
                        <>
                            {/* ── Google login ── */}
                            <div className="mb-8">
                                <div className="flex flex-col items-center gap-4">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => toast.error('Google Sign-in failed')}
                                        text="continue_with"
                                        shape="square"
                                        width="100%"
                                    />
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="flex-1 h-[1px] bg-black/10" />
                                        <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">or manual setup</span>
                                        <div className="flex-1 h-[1px] bg-black/10" />
                                    </div>
                                </div>
                            </div>

                            {/* ── Register form ── */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Section: Organization */}
                                <div className="border-l-2 border-[#ff0000] pl-3 mb-1">
                                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#ff0000]">
                                        Organization
                                    </span>
                                </div>
                                <Field
                                    icon={FiGlobe}
                                    name="orgName"
                                    type="text"
                                    required
                                    value={form.orgName}
                                    onChange={handleChange}
                                    placeholder="Global Tooling Ltd"
                                />

                                {/* Section: Admin */}
                                <div className="border-l-2 border-black pl-3 mt-6 mb-1 pt-2">
                                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-500">
                                        Admin Credentials
                                    </span>
                                </div>
                                <Field
                                    icon={FiUser}
                                    name="adminName"
                                    type="text"
                                    required
                                    value={form.adminName}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                />
                                <Field
                                    icon={FiMail}
                                    name="adminEmail"
                                    type="email"
                                    required
                                    value={form.adminEmail}
                                    onChange={handleChange}
                                    placeholder="admin@company.com"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Field
                                        icon={FiLock}
                                        name="adminPassword"
                                        type="password"
                                        required={!finalGoogleUser}
                                        value={form.adminPassword}
                                        onChange={handleChange}
                                        placeholder="Set Password"
                                    />
                                    <Field
                                        icon={FiLock}
                                        name="confirmPassword"
                                        type="password"
                                        required={!finalGoogleUser}
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm"
                                    />
                                </div>

                                <div className="border-l-2 border-[#ff0000] pl-3 mt-6 mb-1">
                                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#ff0000]">
                                        WhatsApp Verification
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-20 bg-gray-100 border-2 border-black flex items-center justify-center font-mono text-sm font-bold">
                                        +91
                                    </div>
                                    <div className="flex-1">
                                        <Field
                                            icon={FiPhone}
                                            name="whatsappNumber"
                                            type="text"
                                            required
                                            value={form.whatsappNumber}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setForm(prev => ({ ...prev, whatsappNumber: val }));
                                            }}
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ x: 4, y: -4 }}
                                    whileTap={{ x: 0, y: 0 }}
                                    className="w-full mt-2 bg-[#ff0000] text-white font-black py-4 uppercase tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow hover:shadow-none"
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>INITIALIZE WORKSPACE <FiArrowRight size={16} /></>
                                    )}
                                </motion.button>
                            </form>
                        </>
                    )}

                    {/* Back to login */}
                    <div className="mt-8 pt-8 border-t-2 border-black text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em] text-gray-400 hover:text-black transition-colors"
                        >
                            <FiArrowLeft size={12} /> Back to Command Center
                        </Link>
                    </div>

                    <p className="mt-6 text-center text-[9px] font-mono uppercase tracking-[0.4em] text-gray-300">
                        System Protocol 2.4.0 — Secure Auth Layer
                    </p>
                </motion.div>
            </div>
        </div >
    );
};

export default RegisterOrg;
