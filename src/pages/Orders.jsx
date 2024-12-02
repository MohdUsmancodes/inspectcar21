import React, { useState, useEffect } from 'react';
import { fetchUserOrders } from '../utils/firebaseUtils';
import { useAuth } from '../context/AuthContext'; // Assuming you have an auth context
import { motion } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth(); // Get current user from auth context

  useEffect(() => {
    const loadOrders = async () => {
      if (!currentUser) {
        setError('Please log in to view your orders');
        setLoading(false);
        return;
      }

      try {
        const userOrders = await fetchUserOrders(currentUser.uid);
        setOrders(userOrders);
        setLoading(false);
      } catch (err) {
        setError('Failed to load orders');
        setLoading(false);
      }
    };

    loadOrders();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-400">
          No orders found
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-white">
                  Order #{order.id.slice(-6)}
                </span>
                <span 
                  className={`px-3 py-1 rounded-full text-xs ${
                    order.status === 'completed' 
                      ? 'bg-green-500/20 text-green-400' 
                      : order.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between text-white"
                  >
                    <span>{item.title}</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="font-bold text-white">
                  ${order.total?.toFixed(2) || 0}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
