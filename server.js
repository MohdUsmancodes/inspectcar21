const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5173;  // Match Vite's default port

app.use(cors({
  origin: 'http://localhost:5173',  // Allow requests from Vite dev server
  credentials: true
}));
app.use(express.json());

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  // Basic token validation (replace with more secure method in production)
  if (!token || token !== 'admin_access_token') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  next();
};

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  next();
});

// Admin stats endpoint
app.get('/api/admin/stats', verifyAdminToken, async (req, res) => {
  try {
    // Read orders from JSON file
    const ordersPath = path.join(__dirname, 'src/data/orders.json');
    const ordersData = await fs.readFile(ordersPath, 'utf8');
    const orders = JSON.parse(ordersData);

    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);

    res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Admin orders endpoint
app.get('/api/admin/orders', verifyAdminToken, async (req, res) => {
  try {
    const ordersPath = path.join(__dirname, 'src/data/orders.json');
    const ordersData = await fs.readFile(ordersPath, 'utf8');
    const orders = JSON.parse(ordersData);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Admin prices endpoint
app.get('/api/admin/prices', verifyAdminToken, async (req, res) => {
  try {
    const settingsPath = path.join(__dirname, 'src/config/settings.json');
    const settingsData = await fs.readFile(settingsPath, 'utf8');
    const settings = JSON.parse(settingsData);
    res.json(settings.prices || {});
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ message: 'Error fetching prices' });
  }
});

app.post('/api/admin/prices', verifyAdminToken, async (req, res) => {
  try {
    const settingsPath = path.join(__dirname, 'src/config/settings.json');
    const settingsData = await fs.readFile(settingsPath, 'utf8');
    const settings = JSON.parse(settingsData);

    // Update prices
    settings.prices = req.body;

    // Write updated settings back to file
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));

    res.json({ message: 'Prices updated successfully' });
  } catch (error) {
    console.error('Error updating prices:', error);
    res.status(500).json({ message: 'Error updating prices' });
  }
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  // Replace with your actual admin credentials
  const ADMIN_EMAIL = 'admin@example.com';
  const ADMIN_PASSWORD = 'admin123';

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Use a consistent, static token
    const token = 'admin_access_token';
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Catch-all route for debugging
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
