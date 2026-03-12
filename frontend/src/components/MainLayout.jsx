import React, { useState } from 'react';
import { Outlet, NavLink, useMatch } from 'react-router-dom';
import Sidebar from './Sidebar';
import Logo from './Logo';
import { FiMenu, FiX, FiHome, FiTool, FiArrowRight, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const BOTTOM_TABS = [
  { name: 'Dashboard', href: '/dashboard', icon: FiHome },
  { name: 'Tools', href: '/tools', icon: FiTool },
  { name: 'Transactions', href: '/transactions', icon: FiArrowRight },
  { name: 'Users', href: '/users', icon: FiUsers, role: 'Admin' },
  { name: 'Reports', href: '/reports', icon: FiBarChart2, roles: ['Admin', 'Manager'] },
];

const BottomTab = ({ tab, onNavigate }) => {
  const isActive = !!useMatch({ path: tab.href, end: false });
  const Icon = tab.icon;

  return (
    <NavLink
      to={tab.href}
      onClick={onNavigate}
      className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 group"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Gradient pill for icon */}
      <span
        className={`
          relative flex items-center justify-center w-11 h-8 rounded-2xl
          transition-all duration-300 ease-out
          ${isActive
            ? 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/40 scale-110'
            : 'bg-transparent group-active:scale-90'}
        `}
      >
        <Icon
          className={`h-[18px] w-[18px] transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
            }`}
          strokeWidth={isActive ? 2.5 : 1.8}
        />

        {/* Subtle shimmer ring when active */}
        {isActive && (
          <span className="absolute inset-0 rounded-2xl bg-white opacity-10 pointer-events-none" />
        )}
      </span>

      {/* Label */}
      <span
        className={`text-[9px] font-bold tracking-wide transition-all duration-300 ${isActive ? 'text-primary-600 opacity-100' : 'text-gray-400 opacity-80'
          }`}
      >
        {tab.name}
      </span>
    </NavLink>
  );
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const visibleTabs = BOTTOM_TABS.filter(tab => {
    if (tab.role && user?.role !== tab.role) return false;
    if (tab.roles && !tab.roles.includes(user?.role)) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
            <div className="scale-75 origin-left">
              <Logo />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 pb-28 lg:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* ── Floating Glassmorphism Bottom Nav (mobile only) ── */}
        {!isSuperAdmin && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pointer-events-none">
            <nav
              className="pointer-events-auto flex items-stretch rounded-[28px] px-3 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.7)',
              }}
            >
              {visibleTabs.map(tab => (
                <BottomTab key={tab.href} tab={tab} onNavigate={closeSidebar} />
              ))}
            </nav>
          </div>
        )}

      </div>
    </div>
  );
};

export default MainLayout;