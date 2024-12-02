import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './contexts/CartContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrdersProvider } from './context/OrdersContext';
import MainLayout from './Mainlayout';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import NotFound from './pages/NotFound';
import PasswordReset from './pages/PasswordReset';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/admin/login');
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return currentUser ? children : null;
};

function App() {
  return (
    <AuthProvider>
      <OrdersProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            success: { duration: 3000 },
            error: { duration: 5000 }
          }} 
        />
        <CartProvider>
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/reset-password" element={<PasswordReset />} />
            {/* 404 Route - Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </OrdersProvider>
    </AuthProvider>
  );
}

export default App;
