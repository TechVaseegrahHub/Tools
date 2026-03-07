import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';

/* ─── tiny raw noise grid overlay ─── */
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

/* ─── floating red / black geometric shapes for parallax panel ─── */
const FloatingShapes = ({ mouseX, mouseY }) => {
  const shapes = [
    { size: 180, x: '8%', y: '12%', color: '#ff0000', opacity: 0.12, depth: 0.04 },
    { size: 90, x: '70%', y: '20%', color: '#000000', opacity: 0.18, depth: 0.07 },
    { size: 50, x: '55%', y: '55%', color: '#ff0000', opacity: 0.25, depth: 0.10 },
    { size: 130, x: '15%', y: '65%', color: '#000000', opacity: 0.10, depth: 0.05 },
    { size: 60, x: '80%', y: '78%', color: '#ff0000', opacity: 0.20, depth: 0.08 },
    { size: 200, x: '40%', y: '40%', color: '#000000', opacity: 0.04, depth: 0.02 },
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
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              background: s.color,
              opacity: s.opacity,
              x: sx,
              y: sy,
            }}
          />
        );
      })}
    </>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const from = location.state?.from?.pathname || '/';

  /* ── Mouse parallax ── */
  const containerRef = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    rawY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  /* ── Scroll parallax for left panel text ── */
  const { scrollY } = useScroll();
  const panelY = useTransform(scrollY, [0, 400], [0, 80]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.role === 'SuperAdmin') {
        navigate('/superadmin', { replace: true });
      } else {
        const destination = from === '/' ? '/dashboard' : from;
        navigate(destination, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Google sign-in ── */
  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      // credentialResponse.credential IS the ID token
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result?.newUser) {
        // Unknown Google email — redirect to register page with pre-filled data
        navigate('/register-org', {
          state: { googleUser: { name: result.name, email: result.email, idToken: credentialResponse.credential } },
        });
      } else if (result?.role === 'SuperAdmin') {
        navigate('/superadmin', { replace: true });
      } else {
        const destination = from === '/' ? '/dashboard' : from;
        navigate(destination, { replace: true });
      }
    } catch (_) {
      // error already toasted
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen flex bg-white overflow-hidden"
    >
      {/* ════════════════════════════════════
          LEFT — parallax brutalist panel
      ════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-black border-r-4 border-black">
        <GridBg />
        <FloatingShapes mouseX={rawX} mouseY={rawY} />

        {/* Red diagonal slash accent */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div
            className="absolute bg-[#ff0000]"
            style={{
              width: '3px',
              height: '160%',
              top: '-30%',
              left: '60%',
              transform: 'rotate(18deg)',
              opacity: 0.15,
            }}
          />
          <div
            className="absolute bg-[#ff0000]"
            style={{
              width: '3px',
              height: '160%',
              top: '-30%',
              left: '63%',
              transform: 'rotate(18deg)',
              opacity: 0.08,
            }}
          />
        </div>

        {/* Content */}
        <motion.div
          style={{ y: panelY }}
          className="relative z-10 flex flex-col justify-center p-16 h-full"
        >
          {/* System badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 border-2 border-[#ff0000] px-4 py-1 mb-12 w-fit"
          >
            <span className="w-2 h-2 rounded-full bg-[#ff0000] animate-pulse" />
            <span className="text-[#ff0000] font-mono text-[10px] uppercase tracking-[0.3em] font-black">
              AUTH_LAYER / V2.0
            </span>
          </motion.div>

          {/* Big headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-white font-black uppercase leading-[0.88] tracking-tighter mb-8"
            style={{ fontFamily: 'Syncopate, sans-serif', fontSize: 'clamp(3rem, 5vw, 5.5rem)' }}
          >
            TOOL
            <br />
            <span style={{ WebkitTextStroke: '2px #ff0000', color: 'transparent' }}>ROOM.</span>
          </motion.h1>

          {/* Divider */}
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
            className="text-white/40 font-mono text-xs uppercase tracking-[0.25em] leading-relaxed max-w-xs border-l-2 border-white/10 pl-4"
          >
            SYSTEMATIC TOOL INVENTORY MANAGEMENT.
            TRACK CHECK-INS, CHECK-OUTS, AND WORKFLOWS WITH RAW PRECISION.
          </motion.p>

          {/* Animated stat blocks */}
          <div className="mt-16 grid grid-cols-2 gap-4 max-w-xs">
            {[
              { label: '/AVAILABLE', value: '124', bg: 'border-white/10 text-white' },
              { label: '/IN_USE', value: '48', bg: 'bg-[#ff0000] border-[#ff0000] text-white' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className={`border-2 p-4 ${s.bg}`}
              >
                <div className="font-mono text-[9px] uppercase tracking-widest opacity-60 mb-1">{s.label}</div>
                <div className="font-black text-4xl tracking-tighter" style={{ fontFamily: 'Syncopate, sans-serif' }}>{s.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ════════════════════════════════════
          RIGHT — login form (white)
      ════════════════════════════════════ */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-12 bg-white relative">
        <GridBg />

        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <span className="font-black text-xl uppercase tracking-tighter" style={{ fontFamily: 'Syncopate, sans-serif' }}>
            TOOLROOM
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 font-mono text-[9px] uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 bg-[#ff0000] rounded-full animate-pulse" />
              SECURE_AUTH
            </div>
            <h2
              className="text-4xl font-black uppercase text-black tracking-tighter leading-tight"
              style={{ fontFamily: 'Syncopate, sans-serif' }}
            >
              SIGN IN
            </h2>
            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-2">
              Enter your credentials to access the system
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-2">
                Authorized Email
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff0000] transition-colors" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-2 border-black py-4 pl-11 pr-4 text-black placeholder:text-gray-300 font-mono text-sm focus:outline-none focus:border-[#ff0000] focus:ring-0 transition-colors"
                  placeholder="operator@toolroom.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">
                  Secure Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[9px] font-mono uppercase tracking-widest text-gray-400 hover:text-[#ff0000] transition-colors"
                >
                  Recover Keys →
                </Link>
              </div>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff0000] transition-colors" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-2 border-black py-4 pl-11 pr-11 text-black placeholder:text-gray-300 font-mono text-sm focus:outline-none focus:border-[#ff0000] focus:ring-0 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ x: 4, y: -4 }}
              whileTap={{ x: 0, y: 0 }}
              className="w-full relative bg-[#ff0000] text-white font-black py-4 uppercase tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow hover:shadow-none"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>INITIALIZE ACCESS <FiArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          {/* Google Sign-in Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-black/10" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">or</span>
            <div className="flex-1 h-[1px] bg-black/10" />
          </div>

          {/* Continue with Google */}
          <div className="mt-4 flex flex-col items-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => { setGoogleLoading(false); }}
              text="continue_with"
              shape="square"
              width="100%"
            />
          </div>

          {/* Divider + Register link */}
          <div className="mt-8 pt-8 border-t-2 border-black text-center">
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-gray-400 mb-4">
              New to the workstation?
            </p>
            <Link
              to="/register-org"
              className="inline-flex items-center gap-2 border-2 border-black px-5 py-2.5 font-black text-xs uppercase tracking-widest bg-white text-black hover:bg-black hover:text-white transition-colors"
            >
              REGISTER ORGANISATION <FiArrowRight size={14} />
            </Link>
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-[9px] font-mono uppercase tracking-[0.4em] text-gray-300">
            System Protocol 2.4.0 — Secure Auth Layer
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;