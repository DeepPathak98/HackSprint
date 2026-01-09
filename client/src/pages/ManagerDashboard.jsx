import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Loader, AlertTriangle } from 'lucide-react';
import MainNavigation from '../components/common/MainNavigation';
import { useAuth } from '../context/AuthContext';

export default function ManagerDashboard({ user }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Use auth context user if component user is not provided
  const currentUser = user || authUser;

  const fetchDashboardData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        if (isInitial) {
          setLoading(false);
        }
        return;
      }

      const response = await fetch('/api/analytics/dashboard-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
        <MainNavigation user={currentUser} />
        <main className="px-6 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-cyan-400">
              <Loader className="w-6 h-6 animate-spin" />
              <span>Loading dashboard data...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
        <MainNavigation user={currentUser} />
        <main className="px-6 py-6">
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
            <button
              onClick={() => fetchDashboardData(true)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const filteredRequests = dashboardData?.recentRequests?.filter(request =>
    request.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.technician?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.technician?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'repaired' || s === 'completed') return 'bg-green-500/20 text-green-300';
    if (s === 'in progress' || s === 'in-progress' || s === 'in_progress') return 'bg-blue-500/20 text-blue-300';
    if (s === 'new' || s === 'pending') return 'bg-yellow-500/20 text-yellow-300';
    if (s === 'scrap' || s === 'scrapped') return 'bg-gray-600/20 text-gray-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-300';
      case 'high':
        return 'bg-orange-500/20 text-orange-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'low':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">

      <main className="px-6 py-6">
        {/* Manager Menu */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Manager Menu</h1>
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/manager-dashboard')} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg text-white font-medium">Dashboard</button>
            <button onClick={() => navigate('/maintenance-calendar')} className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg text-white font-medium">Calendar</button>
            <button onClick={() => navigate('/equipment')} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg text-white font-medium">Equipment</button>
            <button onClick={() => navigate('/reporting')} className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg text-white font-medium">Reports</button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search maintenance requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Maintenance Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Recent Maintenance Requests</h2>
            <p className="text-sm text-gray-400 mt-1">
              Showing {filteredRequests.length} of {dashboardData?.recentRequests?.length || 0} requests
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Technician</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => navigate(`/maintenance/${item._id}`)}>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.equipment?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {item.technician ? `${item.technician.firstName} ${item.technician.lastName}` : 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(item.priority)}`}>
                          {item.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                          {item.status === 'In Progress' ? 'In Progress' : item.status || 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      {searchTerm ? 'No maintenance requests found matching your search.' : 'No maintenance requests found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

