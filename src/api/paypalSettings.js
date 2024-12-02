import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'src/config/settings.json');

// Initialize settings file if it doesn't exist
async function initializeSettingsFile() {
  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    const defaultSettings = {
      paypal: {
        enabled: true
      }
    };
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
  }
}

// Get PayPal settings
export async function getPayPalSettings() {
  try {
    await initializeSettingsFile();
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(data);
    return {
      success: true,
      paypal: settings.paypal
    };
  } catch (error) {
    console.error('Error getting PayPal settings:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Update PayPal settings
export async function updatePayPalSettings(enabled) {
  try {
    await initializeSettingsFile();
    
    // Read current settings
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(data);
    
    // Update PayPal settings
    settings.paypal = {
      ...settings.paypal,
      enabled: Boolean(enabled)
    };
    
    // Write updated settings back to file
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    
    return {
      success: true,
      paypal: settings.paypal
    };
  } catch (error) {
    console.error('Error updating PayPal settings:', error);
    return {
      success: false,
      error: error.message || 'Failed to update PayPal settings'
    };
  }
}
