import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    paypal: {
      enabled: false
    },
    prices: {
      basicReport: 29.99,
      fullReport: 49.99,
      premiumReport: 69.99,
      motorcycleReport: 39.99,
      truckReport: 59.99
    }
  });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:3000/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handlePayPalToggle = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        'http://localhost:3000/api/admin/settings/paypal',
        {
          enabled: !settings.paypal.enabled
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSettings(prev => ({
        ...prev,
        paypal: {
          ...prev.paypal,
          enabled: !prev.paypal.enabled
        }
      }));
      
      setSaveStatus('PayPal settings updated successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error updating PayPal settings:', error);
      setSaveStatus('Error updating PayPal settings');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handlePriceChange = (reportType, value) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setSettings(prev => ({
        ...prev,
        prices: {
          ...prev.prices,
          [reportType]: numericValue
        }
      }));
    }
  };

  const savePrices = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      await axios.post(
        'http://localhost:3000/api/admin/settings/prices',
        {
          prices: settings.prices
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSaveStatus('Prices updated successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error updating prices:', error);
      setSaveStatus('Error updating prices');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        {saveStatus && (
          <div className={`px-4 py-2 rounded-lg ${
            saveStatus.includes('Error') ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
          }`}>
            {saveStatus}
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* PayPal Settings */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Payment Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">PayPal Integration</h3>
                <p className="text-gray-400">Enable or disable PayPal payment buttons on the cart page</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.paypal.enabled}
                  onChange={handlePayPalToggle}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Pricing Settings */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Report Pricing</h2>
            <button
              onClick={savePrices}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Prices'}
            </button>
          </div>
          
          <div className="grid gap-6">
            {/* Car Reports */}
            <div>
              <h3 className="text-lg font-medium mb-4">Car Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Basic Report</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={settings.prices.basicReport}
                      onChange={(e) => handlePriceChange('basicReport', e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Premium Report</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={settings.prices.premiumReport}
                      onChange={(e) => handlePriceChange('premiumReport', e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Standard Report</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={settings.prices.fullReport}
                      onChange={(e) => handlePriceChange('fullReport', e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Other Reports */}
            <div>
              <h3 className="text-lg font-medium mb-4">Other Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Motorcycle Report</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={settings.prices.motorcycleReport}
                      onChange={(e) => handlePriceChange('motorcycleReport', e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Truck Report</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={settings.prices.truckReport}
                      onChange={(e) => handlePriceChange('truckReport', e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
