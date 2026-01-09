import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart3 } from 'lucide-react';
import MainNavigation from '../components/common/MainNavigation';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/dashboard-data', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load data');
      const data = await res.json();
      setDashboardData(data);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <MainNavigation user={currentUser} />
      <main className="p-6">Loading...</main>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <MainNavigation user={currentUser} />
      <main className="p-6">Error: {error}</main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <MainNavigation user={currentUser} />
      <main className="p-6">
        {/* Admin Menu */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Admin Menu</h1>
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/admin-dashboard')} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg text-white font-medium">Admin Dashboard</button>
            <button onClick={() => navigate('/users')} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium">Users</button>
            <button onClick={() => navigate('/teams')} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg text-white font-medium">Teams</button>
            <button onClick={() => navigate('/equipment')} className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg text-white font-medium">Equipment</button>
            <button onClick={() => navigate('/reporting')} className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg text-white font-medium">Reports</button>
          </div>
        </div>

        {/* Admin Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
            <h3 className="text-sm text-gray-400 mb-2">Total Equipment</h3>
            <p className="text-3xl font-bold mb-2">{dashboardData?.totalEquipment ?? 0}</p>
            <p className="text-xs text-gray-400">Scrapped: {dashboardData?.scrappedEquipment ?? 0}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
            <h3 className="text-sm text-gray-400 mb-2">Total Requests</h3>
            <p className="text-3xl font-bold mb-2">{dashboardData?.totalRequests ?? 0}</p>
            <p className="text-xs text-gray-400">Pending: {dashboardData?.pendingRequests ?? 0}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">System Status</p>
                <p className="text-3xl font-bold">Active</p>
              </div>
              <BarChart3 className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Quick Admin Tools */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Admin Tools</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => navigate('/users')} className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-colors">
              <p className="font-semibold">Manage Users</p>
              <p className="text-sm text-gray-400">Add, edit, or remove users</p>
            </button>
            <button onClick={() => navigate('/teams')} className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-colors">
              <p className="font-semibold">Manage Teams</p>
              <p className="text-sm text-gray-400">Organize and manage teams</p>
            </button>
            <button onClick={() => navigate('/equipment')} className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-colors">
              <p className="font-semibold">Manage Equipment</p>
              <p className="text-sm text-gray-400">Track equipment inventory</p>
            </button>
            <button onClick={() => navigate('/reporting')} className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-colors">
              <p className="font-semibold">View Reports</p>
              <p className="text-sm text-gray-400">Analytics and statistics</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
