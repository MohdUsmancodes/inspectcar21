import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  where, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';

// Create Orders Context
const OrdersContext = createContext();

// Orders Provider Component
export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch orders
  const fetchOrders = async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const ordersRef = collection(db, 'orders');
      
      // Build query with optional filters
      const q = query(
        ordersRef,
        ...(options.status && options.status !== 'all' 
          ? [where('status', '==', options.status)] 
          : []),
        orderBy('createdAt', 'desc'),
        limit(options.limit || 50)
      );

      const querySnapshot = await getDocs(q);
      
      const fetchedOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setOrders(fetchedOrders);
      return fetchedOrders;
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err);
      toast.error('Failed to fetch orders');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    orders,
    loading,
    error,
    fetchOrders
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};

// Custom hook to use Orders context
export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
