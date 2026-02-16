import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiBarChart, FiTool, FiUser, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalTools: 0,
    availableTools: 0,
    checkedOutTools: 0,
    overdueTools: 0,
    totalUsers: 0,
    activeUsers: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const statsResponse = await axios.get('/api/dashboard/stats');
        setReportData(statsResponse.data);
        
        // Fetch recent activity
        const activityResponse = await axios.get('/api/dashboard/recent');
        setRecentActivity(activityResponse.data);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
        toast.error('Failed to fetch report data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">View detailed reports and analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tools</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{reportData.totalTools}</p>
            </div>
            <div className="p-3 rounded-full bg-primary-50 text-primary-600">
              <FiTool className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Available Tools</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{reportData.availableTools}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <FiBarChart className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{reportData.totalUsers}</p>
            </div>
            <div className="p-3 rounded-full bg-secondary-50 text-secondary-600">
              <FiUser className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <FiCalendar className="h-5 w-5 text-primary-500" />
        </div>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">No recent activity</p>
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start p-3 hover:bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiBarChart className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.time).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;