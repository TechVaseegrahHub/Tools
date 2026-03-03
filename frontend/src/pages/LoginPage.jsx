import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiTool, FiSettings, FiZap, FiBox, FiArrowRight } from 'react-icons/fi';
import { GiGears, GiSpanner, GiScrew } from 'react-icons/gi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  return (
    <div className="min-h-screen flex bg-[#0f172a] overflow-hidden selection:bg-blue-500/30">
      {/* Left Side: Animated Graphics (Visible on Large Screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-900 via-[#0f172a] to-slate-900 border-r border-white/5">

        {/* Background Decorative Gears */}
        <div className="absolute top-10 left-10 text-white/5 animate-gear">
          <GiGears size={200} />
        </div>
        <div className="absolute bottom-10 right-10 text-white/5 animate-gear" style={{ animationDirection: 'reverse' }}>
          <GiGears size={150} />
        </div>

        {/* Main Mechanical Composition */}
        <div className="relative z-10 w-full max-w-lg">
          <div className="relative h-96 flex items-center justify-center">

            {/* Central Gear */}
            <div className="absolute text-blue-500/20 animate-gear">
              <GiGears size={320} />
            </div>

            {/* Floating Tools */}
            <div className="absolute top-0 left-1/4 animate-spanner text-blue-400/80 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <GiSpanner size={80} />
            </div>

            <div className="absolute bottom-1/4 right-1/4 animate-screw text-slate-400/60">
              <GiScrew size={60} />
            </div>

            <div className="absolute top-1/2 left-10 -translate-y-1/2 animate-bounce duration-1000 text-blue-500/40">
              <FiTool size={40} />
            </div>

            {/* Title Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl">
                <h2 className="text-5xl font-black text-white tracking-tighter mb-2">ToolRoom</h2>
                <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto" />
                <p className="mt-4 text-slate-400 font-medium uppercase tracking-[0.3em] text-xs">Precision Inventory Control</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tagline */}
        <div className="mt-12 text-center max-w-sm">
          <h3 className="text-white text-xl font-semibold mb-3">Enterprise Grade Management</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Experience the next generation of tool tracking and industrial inventory management with machine-like precision.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Background Mobile Decor */}
        <div className="lg:hidden absolute inset-0 -z-10 opacity-10">
          <GiGears className="absolute -top-20 -left-20 animate-gear" size={300} />
          <GiSpanner className="absolute -bottom-20 -right-20 animate-spanner" size={300} />
        </div>

        <div className={`w-full max-w-md transition-all duration-1000 ease-out ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
          <div className="mb-10 lg:hidden text-center">
            <div className="inline-flex p-4 bg-blue-600/20 rounded-2xl mb-4 border border-blue-500/30">
              <GiSpanner className="text-blue-500 h-10 w-10 animate-spanner" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">ToolRoom</h1>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400 text-sm">Sign in to your professional workstation</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Authorized Email</label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="operator@toolroom.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Secure Password</label>
                  <Link to="/forgot-password" size="sm" className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors">Recover Keys</Link>
                </div>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="flex items-center justify-center">
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Initialize Access <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-slate-400 text-sm mb-4">New to the workstation?</p>
              <Link
                to="/register-org"
                className="inline-flex items-center space-x-2 text-white font-bold hover:text-blue-400 transition-colors group"
              >
                <span>Register Organisation</span>
                <FiBox className="group-hover:rotate-12 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600 text-[10px] uppercase tracking-[0.5em]">
              System Protocol 2.4.0 — Secure Auth Layer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;