import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiTool,
  FiArrowRight,
  FiUsers,
  FiBarChart,
  FiLogOut,
  FiUser,
  FiGlobe,
  FiShield,
  FiSettings,
  FiZap,
  FiDollarSign,
} from 'react-icons/fi';
import Logo from './Logo';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'SuperAdmin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  // SuperAdmin sees org management; normal users see the usual nav
  const navigation = isSuperAdmin
    ? [
      { name: 'Org Management', href: '/superadmin', icon: FiGlobe },
      { name: 'Finance', href: '/finance', icon: FiDollarSign },
    ]
    : [
      { name: 'Dashboard', href: '/dashboard', icon: FiHome },
      { name: 'Tool Inventory', href: '/tools', icon: FiTool },
      { name: 'Transactions', href: '/transactions', icon: FiArrowRight },
      { name: 'Manage Users', href: '/users', icon: FiUsers, role: 'Admin' },
      { name: 'Reports', href: '/reports', icon: FiBarChart, roles: ['Admin', 'Manager'] },
      { name: 'Settings', href: '/settings', icon: FiSettings, role: 'Admin' },
      { name: 'Subscription', href: '/subscription', icon: FiZap, role: 'Admin' },
    ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg flex-shrink-0 h-screen flex flex-col border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo / Brand */}
        <div className="flex items-center px-6 py-5 border-b border-gray-200 h-[72px]">
          <Logo isSuperAdmin={isSuperAdmin} />
        </div>

        {/* Org Name Badge (only for tenant users) */}
        {!isSuperAdmin && user?.org?.name && (
          <div className="mx-4 mt-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2">
            <FiGlobe className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-blue-700 truncate">{user.org.name}</p>
              <p className="text-xs text-blue-400">Your Organization</p>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            if (item.role && user?.role !== item.role) return null;
            if (item.roles && !item.roles.includes(user?.role)) return null;

            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/' || item.href === '/superadmin'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  isActive ? 'sidebar-link-active' : 'sidebar-link'
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile and Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`rounded-full p-2 ${isSuperAdmin ? 'bg-purple-100' : 'bg-gray-200'}`}>
              {isSuperAdmin
                ? <FiShield className="h-5 w-5 text-purple-600" />
                : <FiUser className="h-5 w-5 text-gray-600" />
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className={`text-xs truncate ${isSuperAdmin ? 'text-purple-500 font-semibold' : 'text-gray-500'}`}>
                {user?.role || 'Role'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-600 hover:bg-red-50"
          >
            <FiLogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;