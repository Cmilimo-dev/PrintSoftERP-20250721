const { db, uuidv4 } = require('../config/database');

// Settings are now stored in system_settings table
// Mock data removed - using database operations

const getSettings = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT 
        setting_key as \`key\`,
        setting_value as value,
        description,
        setting_type as type,
        is_public
      FROM system_settings 
      WHERE 1=1
    `;
    
    const params = [];
    
    // Note: The current database schema doesn't have category/subcategory columns
    // If you need category filtering, you'll need to modify the database schema
    
    query += ` ORDER BY setting_key`;
    
    const [settings] = await db.execute(query, params);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { key, value, description = '', setting_type = 'string', is_public = false } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Key and value are required' 
      });
    }
    
    // Check if setting exists
    const [existingSettings] = await db.execute(
      'SELECT id FROM system_settings WHERE setting_key = ?',
      [key]
    );
    
    if (existingSettings.length > 0) {
      // Update existing setting
      await db.execute(
        'UPDATE system_settings SET setting_value = ?, description = ?, setting_type = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
        [value, description, setting_type, is_public, key]
      );
    } else {
      // Create new setting
      await db.execute(
        'INSERT INTO system_settings (id, setting_key, setting_value, description, setting_type, is_public) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), key, value, description, setting_type, is_public]
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Setting updated successfully' 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

const resetSettings = async (req, res) => {
  try {
    // Define default settings
    const defaultSettings = [
      { key: 'company_name', value: 'PrintSoft ERP', description: 'Company name', setting_type: 'string', is_public: true },
      { key: 'currency', value: 'USD', description: 'Default currency', setting_type: 'string', is_public: true },
      { key: 'timezone', value: 'UTC', description: 'Default timezone', setting_type: 'string', is_public: true },
      { key: 'email_notifications', value: 'true', description: 'Enable email notifications', setting_type: 'boolean', is_public: false },
      { key: 'sms_notifications', value: 'false', description: 'Enable SMS notifications', setting_type: 'boolean', is_public: false },
      { key: 'tax_rate', value: '10', description: 'Default tax rate percentage', setting_type: 'number', is_public: true },
      { key: 'invoice_due_days', value: '30', description: 'Default invoice due days', setting_type: 'number', is_public: true }
    ];

    // Clear existing settings
    await db.execute('DELETE FROM system_settings');

    // Insert default settings
    for (const setting of defaultSettings) {
      await db.execute(
        'INSERT INTO system_settings (id, setting_key, setting_value, description, setting_type, is_public) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), setting.key, setting.value, setting.description, setting.setting_type, setting.is_public]
      );
    }

    res.json({ 
      success: true, 
      message: 'Settings have been reset to default values.' 
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reset settings', 
      message: error.message 
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings
};
