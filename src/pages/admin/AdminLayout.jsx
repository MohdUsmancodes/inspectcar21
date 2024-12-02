import React from 'react';
import { Link, Outlet, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Settings, LogOut } from 'lucide-react';
import Dashboard from './Dashboard';
import Orders from './Orders';
import PriceManagement from './PriceManagement';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-gray-900 p-4 space-y-4">
          <div className="text-2xl font-bold text-red-500 mb-8">Admin Panel</div>
          
          <nav className="space-y-2">
            <Link
              to="/admin/dashboard"
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                isActive('/admin/dashboard')
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-gray-800'
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/admin/orders"
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                isActive('/admin/orders')
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-gray-800'
              }`}
            >
              <ShoppingCart size={20} />
              <span>Orders</span>
            </Link>

            <Link
              to="/admin/prices"
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                isActive('/admin/prices')
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-gray-800'
              }`}
            >
              <Settings size={20} />
              <span>Price Management</span>
            </Link>

            <Link
              to="/admin/settings"
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                isActive('/admin/settings')
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-gray-800'
              }`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="absolute bottom-4 w-56">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-800 w-full"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="prices" element={<PriceManagement />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
