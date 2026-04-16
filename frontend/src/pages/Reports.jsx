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
    <div className="space-y-12 pb-20">
      <div className="bg-black border-l-[16px] border-accent rounded-xl p-10 text-white relative overflow-hidden group">
        <div className="grid-bg opacity-[0.1]" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">System Reports</h1>
          <p className="text-white/40 text-[12px] font-black uppercase tracking-[0.4em] italic mb-2">// View data about your tools and inventory //</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
        <div className="bg-white border-2 border-black p-8 shadow-brutal relative overflow-hidden group">
          <div className="grid-bg opacity-[0.05]" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mb-2">Tools</p>
              <p className="text-5xl font-black text-black tracking-tighter italic">{reportData.totalTools}</p>
            </div>
            <div className="p-4 bg-black text-white border-2 border-black rotate-12 group-hover:rotate-0 transition-transform">
              <FiTool className="h-8 w-8" strokeWidth={4} />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black p-8 shadow-brutal relative overflow-hidden group">
          <div className="grid-bg opacity-[0.05]" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-accent italic mb-2">Available</p>
              <p className="text-5xl font-black text-black tracking-tighter italic">{reportData.availableTools}</p>
            </div>
            <div className="p-4 bg-accent text-white border-2 border-black -rotate-12 group-hover:rotate-0 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <FiBarChart className="h-8 w-8" strokeWidth={4} />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black p-8 shadow-brutal relative overflow-hidden group border-r-8">
          <div className="grid-bg opacity-[0.05]" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mb-2">Users</p>
              <p className="text-5xl font-black text-black tracking-tighter italic">{reportData.totalUsers}</p>
            </div>
            <div className="p-4 bg-black text-accent border-2 border-black group-hover:scale-110 transition-transform">
              <FiUser className="h-8 w-8" strokeWidth={4} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border-4 border-black p-10 shadow-brutal relative overflow-hidden group">
        <div className="grid-bg opacity-[0.05]" />
        <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Recent Activity</h2>
          <div className="p-3 bg-accent text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <FiCalendar className="h-6 w-6" strokeWidth={4} />
          </div>
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