import express from 'express';
import { getPayPalSettings, updatePayPalSettings } from './paypalSettings.js';

const router = express.Router();

// Get PayPal settings
router.get('/paypal', async (req, res) => {
  const result = await getPayPalSettings();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// Update PayPal settings
router.post('/paypal', async (req, res) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Invalid enabled value. Must be a boolean.'
      });
    }

    const result = await updatePayPalSettings(enabled);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in /paypal POST:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
