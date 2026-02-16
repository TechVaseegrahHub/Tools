import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiTool, FiSettings, FiZap, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Floating Element Component
const FloatingElement = ({ icon: Icon, delay, position, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  const positions = {
    'top-left': 'top-20 left-10',
    'top-right': 'top-16 right-16',
    'bottom-left': 'bottom-24 left-12',
    'bottom-right': 'bottom-20 right-20',
    'center-left': 'top-1/2 left-8',
    'center-right': 'top-1/3 right-12'
  };

  return (
    <div 
      className={`absolute ${positions[position]} ${sizeClasses[size]} animate-float`}
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: `${3 + delay}s`
      }}
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20 shadow-lg">
        <Icon className="text-white/80 w-full h-full" />
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the path to redirect to after login, or default to '/'
  const from = location.state?.from?.pathname || '/';

  // Trigger animation on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      // On success, navigate to the page the user was trying to access
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Elements */}
        <FloatingElement icon={FiSettings} delay={0} position="top-left" size="sm" />
        <FloatingElement icon={FiZap} delay={0.5} position="top-right" size="md" />
        <FloatingElement icon={FiShield} delay={1} position="bottom-left" size="sm" />
        <FloatingElement icon={FiTool} delay={1.5} position="bottom-right" size="lg" />
        <FloatingElement icon={FiSettings} delay={2} position="center-left" size="sm" />
        <FloatingElement icon={FiZap} delay={2.5} position="center-right" size="md" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Subtle moving particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-pulse"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className={`w-full max-w-md transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="mx-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <FiTool className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">ToolRoom</h1>
              <p className="text-blue-200 text-lg">Professional Tool Management</p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full mt-4"></div>
            </div>
          </div>
          
          {/* Login Card */}
          <div className={`card p-8 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl transform transition-all duration-500 hover:shadow-3xl ${isMounted ? 'scale-100' : 'scale-95'}`}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Email Field */}
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-semibold text-gray-700"
                >
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                    <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                    <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <FiLock className="mr-2 h-5 w-5" />
                      Sign In
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-blue-200 text-sm">
              © {new Date().getFullYear()} ToolRoom. All rights reserved.
            </p>
            <div className="flex justify-center space-x-4 mt-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;