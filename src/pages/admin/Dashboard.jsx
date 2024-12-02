import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-700/50 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <DollarSign size={24} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white">${(stats?.totalRevenue || 0).toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-700/50 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400">Total Orders</p>
              <h3 className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-700/50 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400">Average Order Value</p>
              <h3 className="text-2xl font-bold text-white">${(stats?.averageOrderValue || 0).toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="pb-4">Order ID</th>
                <th className="pb-4">Customer</th>
                <th className="pb-4">Amount</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders?.length || 0) > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order?.orderId} className="border-t border-gray-700">
                    <td className="py-4 text-white">{order?.orderId}</td>
                    <td className="py-4 text-white">{order?.customerName}</td>
                    <td className="py-4 text-white">${(order?.amount || 0).toFixed(2)}</td>
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-500">
                        {order?.paymentStatus || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
