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
  FiSettings
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'Tool Inventory', href: '/tools', icon: FiTool },
    { name: 'Transactions', href: '/transactions', icon: FiArrowRight },
    { name: 'Manage Users', href: '/users', icon: FiUsers, role: 'Admin' },
    { name: 'Reports', href: '/reports', icon: FiBarChart, roles: ['Admin', 'Manager'] },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex-shrink-0 h-screen flex flex-col border-r border-gray-200">
      <div className="flex items-center space-x-3 px-6 py-5 border-b border-gray-200">
        <div className="bg-primary-600 text-white p-2 rounded-lg">
          <FiTool className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ToolRoom</h1>
          <p className="text-xs text-gray-500">Inventory Management</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          // Check if the item should be shown based on user role
          if (item.role && user?.role !== item.role) return null;
          if (item.roles && !item.roles.includes(user?.role)) return null;
          
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => 
                isActive 
                  ? 'sidebar-link-active' 
                  : 'sidebar-link'
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
          <div className="bg-gray-200 rounded-full p-2">
            <FiUser className="h-5 w-5 text-gray-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
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
  );
};

export default Sidebar;