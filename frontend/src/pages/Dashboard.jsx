import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTool, FiCheckCircle, FiClock, FiAlertTriangle, FiActivity, FiCalendar, FiUsers, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Enhanced Stat Card Component with Modern Design
const StatCard = ({ title, value, icon, color = 'primary', trend }) => {
  const colorClasses = {
    primary: 'text-blue-600 bg-blue-50 border-blue-100',
    secondary: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    yellow: 'text-amber-600 bg-amber-50 border-amber-100',
    red: 'text-rose-600 bg-rose-50 border-rose-100',
    purple: 'text-violet-600 bg-violet-50 border-violet-100'
  };
  
  const iconColorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-indigo-600',
    green: 'text-emerald-600',
    yellow: 'text-amber-600',
    red: 'text-rose-600',
    purple: 'text-violet-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`inline-flex items-center text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="text-xs text-gray-400 ml-2">from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]} border`}>
          {React.cloneElement(icon, { className: `h-6 w-6 ${iconColorClasses[color]}` })}
        </div>
      </div>
    </div>
  );
};

// Tool Card Component for Professional Tool Display
const ToolCard = ({ tool, status }) => {
  const statusColors = {
    available: 'bg-emerald-100 text-emerald-800',
    checkedOut: 'bg-amber-100 text-amber-800',
    overdue: 'bg-rose-100 text-rose-800',
    maintenance: 'bg-slate-100 text-slate-800'
  };

  const statusIcons = {
    available: <FiCheckCircle className="h-4 w-4" />,
    checkedOut: <FiClock className="h-4 w-4" />,
    overdue: <FiAlertTriangle className="h-4 w-4" />,
    maintenance: <FiTool className="h-4 w-4" />
  };

  // Handle the actual status from the tool data
  const actualStatus = tool.status?.toLowerCase().replace(' ', '') || status;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{tool.toolName || tool.name || 'Unnamed Tool'}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {typeof tool.category === 'object' ? tool.category.name : tool.category || 'Uncategorized'}
          </p>
          {tool.dueDate && (
            <p className="text-xs text-gray-400 mt-2">Due: {new Date(tool.dueDate).toLocaleDateString()}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">ID: {tool.toolId || 'N/A'}</p>
        </div>
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[actualStatus] || statusColors.available}`}>
          {statusIcons[actualStatus] || statusIcons.available}
          <span className="ml-1 capitalize">{tool.status || 'Available'}</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState([]);
  const navigate = useNavigate();

  // Helper function to ensure we always have an array
  const ensureArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    }
    console.warn('Expected array but received:', data);
    return [];
  };

  // Navigate to tools inventory page
  const handleViewAllTools = () => {
    navigate('/tools');
  };

  useEffect(() => {
    // Fetch all dashboard data
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, overdueRes, recentRes, toolsRes] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/overdue'),
          axios.get('/api/dashboard/recent'),
          axios.get('/api/tools')
        ]);
        setStats(statsRes.data);
        setOverdue(ensureArray(overdueRes.data));
        setRecent(ensureArray(recentRes.data));
        // Ensure tools data is properly formatted
        const toolsData = ensureArray(toolsRes.data).slice(0, 6);
        console.log('Tools data:', toolsData); // For debugging
        setTools(toolsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        toast.error('Failed to fetch dashboard data');
        // Set defaults to prevent errors
        setOverdue([]);
        setRecent([]);
        setTools([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Tool Room Dashboard</h1>
          <p className="text-blue-100 text-lg">Welcome back! Here's what's happening today.</p>
          <div className="flex items-center mt-4 text-sm text-blue-200">
            <FiCalendar className="mr-2" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Tools" 
            value={stats?.totalTools || 0} 
            icon={<FiTool />} 
            color="primary"
            trend={{ positive: true, value: 12 }}
          />
          <StatCard 
            title="Available" 
            value={stats?.toolsAvailable || 0} 
            icon={<FiCheckCircle />} 
            color="green"
            trend={{ positive: true, value: 8 }}
          />
          <StatCard 
            title="Checked Out" 
            value={stats?.toolsCheckedOut || 0} 
            icon={<FiActivity />} 
            color="amber"
            trend={{ positive: false, value: 3 }}
          />
          <StatCard 
            title="Overdue" 
            value={stats?.toolsOverdue || 0} 
            icon={<FiAlertTriangle />} 
            color="red"
            trend={{ positive: false, value: 5 }}
          />
        </div>
      </div>

      {/* Tools Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Tools</h2>
          <button 
            onClick={handleViewAllTools}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center hover:underline"
          >
            View All Tools
            <FiTrendingUp className="ml-1 h-4 w-4" />
          </button>
        </div>
        {tools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => {
              // Add defensive check for tool object
              if (!tool || typeof tool !== 'object') {
                console.warn('Invalid tool data at index', index, ':', tool);
                return null;
              }
              return (
                <ToolCard 
                  key={tool._id || index}
                  tool={tool}
                  status={tool.status?.toLowerCase().replace(' ', '') || 'available'}
                />
              );
            }).filter(Boolean)}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FiTool className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No tools found</h3>
            <p className="mt-2 text-gray-500">Get started by adding some tools to your inventory.</p>
          </div>
        )}
      </div>

      {/* Overdue Tools & Recent Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Overdue Tools Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-rose-100 rounded-lg">
                <FiAlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 ml-3">Overdue Tools</h2>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-800">
              {overdue.length} items
            </span>
          </div>
          
          {overdue.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-3 bg-emerald-100 rounded-full w-16 h-16 mx-auto">
                <FiCheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">All clear!</h3>
              <p className="mt-2 text-gray-500">No overdue tools at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {overdue.slice(0, 5).map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-rose-50 rounded-lg border border-rose-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-rose-200 rounded-lg">
                      <FiAlertTriangle className="h-5 w-5 text-rose-700" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900">{tool.name}</p>
                      <p className="text-sm text-gray-600">{tool.category}</p>
                      <p className="text-xs text-rose-700 mt-1">Due: {new Date(tool.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button className="text-rose-700 hover:text-rose-900 text-sm font-medium">
                    Contact User
                  </button>
                </div>
              ))}
              {overdue.length > 5 && (
                <div className="text-center pt-4">
                  <button 
                    onClick={handleViewAllTools}
                    className="text-rose-600 hover:text-rose-800 font-medium text-sm hover:underline"
                  >
                    View all {overdue.length} overdue items
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Recent Activity Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiBarChart2 className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 ml-3">Recent Activity</h2>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {recent.length} events
            </span>
          </div>
          
          {recent.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto">
                <FiActivity className="h-10 w-10 text-gray-400 mx-auto" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No recent activity</h3>
              <p className="mt-2 text-gray-500">Activity will appear here once tools are checked in or out.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recent.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiActivity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <span className="text-xs text-gray-400">
                        {activity.time || 'Just now'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.user && (
                      <div className="flex items-center mt-2">
                        <div className="p-1 bg-gray-100 rounded">
                          <FiUsers className="h-3 w-3 text-gray-500" />
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{activity.user}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {recent.length > 5 && (
                <div className="text-center pt-4">
                  <button 
                    onClick={() => navigate('/transactions')}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                  >
                    View all activity
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;