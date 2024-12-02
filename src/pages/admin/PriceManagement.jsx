import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PriceManagement = () => {
  const [prices, setPrices] = useState({
    tshirt: 0,
    hoodie: 0,
    longsleeve: 0,
    poster: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('/api/admin/prices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPrices(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching prices:', error);
        toast.error('Failed to fetch current prices');
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  const handlePriceChange = (product, value) => {
    setPrices(prev => ({
      ...prev,
      [product]: parseFloat(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      await axios.post('/api/admin/prices', prices, { headers });
      toast.success('Prices updated successfully');
    } catch (error) {
      console.error('Error updating prices:', error);
      toast.error('Failed to update prices');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white">Price Management</h1>
      
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(prices).map((product) => (
            <div key={product} className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 capitalize">
                {product} Price
              </label>
              <input
                type="number"
                step="0.01"
                value={prices[product]}
                onChange={(e) => handlePriceChange(product, e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Update Prices
          </button>
        </div>
      </form>
    </div>
  );
};

export default PriceManagement;
