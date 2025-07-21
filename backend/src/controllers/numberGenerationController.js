const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const { db, uuidv4 } = require('../config/database');

// Number generation format functions
const generateFormattedNumber = (settings) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = Date.now();
  
  // Get the sequence number (padded to specified length)
  const paddedNumber = String(settings.next_number).padStart(settings.number_length, '0');
  
  // Format mapping
  const formats = {
    'prefix-timestamp': `${settings.prefix}${settings.separator}${timestamp}`,
    'prefix-sequential': `${settings.prefix}${settings.separator}${paddedNumber}`,
    'prefix-year-sequential': `${settings.prefix}${settings.separator}${year}${settings.separator}${paddedNumber}`,
    'prefix-yearmonth-sequential': `${settings.prefix}${settings.separator}${year}${month}${settings.separator}${paddedNumber}`,
    'prefix-date-sequential': `${settings.prefix}${settings.separator}${year}${month}${day}${settings.separator}${paddedNumber}`,
    'year-prefix-sequential': `${year}${settings.separator}${settings.prefix}${settings.separator}${paddedNumber}`,
    'date-prefix-sequential': `${year}${month}${day}${settings.separator}${settings.prefix}${settings.separator}${paddedNumber}`,
    'sequential-only': paddedNumber,
    'custom': settings.custom_format || `${settings.prefix}${settings.separator}${paddedNumber}`
  };
  
  return formats[settings.format] || formats['prefix-sequential'];
};

// Get available format options
const getAvailableFormats = () => {
  return {
    'prefix-timestamp': {
      name: 'Prefix + Timestamp',
      description: 'PAY-1752224798257',
      example: 'PAY-1752224798257'
    },
    'prefix-sequential': {
      name: 'Prefix + Sequential Number',
      description: 'PAY-000001',
      example: 'PAY-000001'
    },
    'prefix-year-sequential': {
      name: 'Prefix + Year + Sequential',
      description: 'PAY-2025-000001',
      example: 'PAY-2025-000001'
    },
    'prefix-yearmonth-sequential': {
      name: 'Prefix + Year/Month + Sequential',
      description: 'PAY-202507-000001',
      example: 'PAY-202507-000001'
    },
    'prefix-date-sequential': {
      name: 'Prefix + Date + Sequential',
      description: 'PAY-20250711-000001',
      example: 'PAY-20250711-000001'
    },
    'year-prefix-sequential': {
      name: 'Year + Prefix + Sequential',
      description: '2025-PAY-000001',
      example: '2025-PAY-000001'
    },
    'date-prefix-sequential': {
      name: 'Date + Prefix + Sequential',
      description: '20250711-PAY-000001',
      example: '20250711-PAY-000001'
    },
    'sequential-only': {
      name: 'Sequential Number Only',
      description: '000001',
      example: '000001'
    },
    'custom': {
      name: 'Custom Format',
      description: 'User-defined format',
      example: 'Custom-Format'
    }
  };
};

// Document type configurations (similar to GRV and PAY patterns)
const documentTypes = {
  customer_return: { prefix: 'CR', defaultStart: 1000, description: 'Customer Return' },
  purchase_order: { prefix: 'PO', defaultStart: 2000, description: 'Purchase Order' },
  vendor: { prefix: 'VEN', defaultStart: 3000, description: 'Vendor' },
  goods_receiving: { prefix: 'GRV', defaultStart: 4000, description: 'Goods Receiving Voucher' },
  sales_order: { prefix: 'SO', defaultStart: 5000, description: 'Sales Order' },
  quotation: { prefix: 'QUO', defaultStart: 6000, description: 'Quotation' },
  invoice: { prefix: 'INV', defaultStart: 7000, description: 'Invoice' },
  receipt: { prefix: 'RCP', defaultStart: 8000, description: 'Receipt' },
  payment_receipt: { prefix: 'PAY', defaultStart: 9000, description: 'Payment Receipt' },
  delivery_note: { prefix: 'DN', defaultStart: 10000, description: 'Delivery Note' },
  credit_note: { prefix: 'CN', defaultStart: 11000, description: 'Credit Note' },
  debit_note: { prefix: 'DB', defaultStart: 12000, description: 'Debit Note' },
  purchase_return: { prefix: 'PR', defaultStart: 13000, description: 'Purchase Return' },
  stock_adjustment: { prefix: 'SA', defaultStart: 14000, description: 'Stock Adjustment' },
  stock_transfer: { prefix: 'ST', defaultStart: 15000, description: 'Stock Transfer' },
  work_order: { prefix: 'WO', defaultStart: 16000, description: 'Work Order' },
  service_order: { prefix: 'SRV', defaultStart: 17000, description: 'Service Order' },
  expense_claim: { prefix: 'EXP', defaultStart: 18000, description: 'Expense Claim' },
  petty_cash: { prefix: 'PC', defaultStart: 19000, description: 'Petty Cash' },
  journal_entry: { prefix: 'JE', defaultStart: 20000, description: 'Journal Entry' }
};

// Initialize number generation settings in database
const initializeNumberGenerationSettings = () => {
  Object.entries(documentTypes).forEach(([type, config]) => {
    db.run(`
      INSERT OR IGNORE INTO number_generation_settings 
      (id, document_type, prefix, next_number, number_length, format, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [uuidv4(), type, config.prefix, config.defaultStart, 6, 'prefix-timestamp', config.description]);
  });
};

const generateNumber = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!documentTypes.hasOwnProperty(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid document type: ${type}. Available types: ${Object.keys(documentTypes).join(', ')}`
      });
    }

    // Get current settings from database
    const getSettingsQuery = `
      SELECT * FROM number_generation_settings 
      WHERE document_type = ? AND is_active = 1
    `;
    
    const [rows] = await db.execute(getSettingsQuery, [type]);
    const settings = rows[0];

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: `Settings not found for document type: ${type}`
      });
    }

    // Get current year
    const currentYear = new Date().getFullYear();
    
// Generate number based on format configuration
    const generatedNumber = generateFormattedNumber(settings);
    
    // Update next number in database
    const updateQuery = `
      UPDATE number_generation_settings 
      SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP
      WHERE document_type = ?
    `;
    
    await db.execute(updateQuery, [type]);

    // Record the generated number in sequences table
    const recordQuery = `
      INSERT INTO document_sequences (id, document_type, document_number, sequence_number)
      VALUES (?, ?, ?, ?)
    `;
    
    await db.execute(recordQuery, [uuidv4(), type, generatedNumber, settings.next_number]);

    res.json({
      success: true,
      data: {
        number: generatedNumber,
        type: type,
        counter: settings.next_number,
        prefix: settings.prefix,
        format: settings.format
      }
    });
  } catch (error) {
    console.error('Error generating number:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate number',
      error: error.message
    });
  }
};

const getNextNumber = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!documentTypes.hasOwnProperty(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid document type: ${type}. Available types: ${Object.keys(documentTypes).join(', ')}`
      });
    }

    // Get current settings from database
    const getSettingsQuery = `
      SELECT * FROM number_generation_settings 
      WHERE document_type = ? AND is_active = 1
    `;
    
    const [rows] = await db.execute(getSettingsQuery, [type]);
    const settings = rows[0];

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: `Settings not found for document type: ${type}`
      });
    }

// Generate next number preview based on format configuration
    const mockSettings = { ...settings, next_number: settings.next_number };
    const nextNumber = generateFormattedNumber(mockSettings);

    res.json({
      success: true,
      data: {
        number: nextNumber,
        type: type,
        counter: settings.next_number,
        prefix: settings.prefix,
        format: settings.format
      }
    });
  } catch (error) {
    console.error('Error getting next number:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get next number',
      error: error.message
    });
  }
};

const resetCounter = async (req, res) => {
  try {
    const { type } = req.params;
    const { value } = req.body;
    
    if (!documentTypes.hasOwnProperty(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid document type: ${type}. Available types: ${Object.keys(documentTypes).join(', ')}`
      });
    }

    const resetValue = parseInt(value) || documentTypes[type].defaultStart;
    
    // Update the counter in database
    const updateQuery = `
      UPDATE number_generation_settings 
      SET next_number = ?, updated_at = CURRENT_TIMESTAMP
      WHERE document_type = ?
    `;
    
    await db.execute(updateQuery, [resetValue, type]);

    res.json({
      success: true,
      data: {
        type: type,
        counter: resetValue
      },
      message: `Counter for ${type} reset to ${resetValue}`
    });
  } catch (error) {
    console.error('Error resetting counter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset counter',
      error: error.message
    });
  }
};

const getAllCounters = async (req, res) => {
  try {
    const query = `SELECT * FROM number_generation_settings WHERE is_active = 1`;
    
    const [rows] = await db.execute(query);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error getting counters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get counters',
      error: error.message
    });
  }
};

const getNumberGenerationSettings = async (req, res) => {
  try {
    const query = `SELECT * FROM number_generation_settings WHERE is_active = 1 ORDER BY document_type`;
    
    const [rows] = await db.execute(query);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error getting number generation settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get number generation settings',
      error: error.message
    });
  }
};

const updateNumberGenerationSettings = async (req, res) => {
  try {
    const { document_type, prefix, next_number, number_length, format, auto_increment } = req.body;
    
    if (!document_type) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required'
      });
    }

    const updateQuery = `
      UPDATE number_generation_settings 
      SET prefix = ?, next_number = ?, number_length = ?, \`format\` = ?, auto_increment = ?, updated_at = CURRENT_TIMESTAMP
      WHERE document_type = ?
    `;
    
    await db.execute(updateQuery, [prefix, next_number, number_length, format, auto_increment, document_type]);

    res.json({
      success: true,
      message: 'Number generation settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating number generation settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update number generation settings',
      error: error.message
    });
  }
};

// Get available number formats
const getAvailableFormatsEndpoint = async (req, res) => {
  try {
    const formats = getAvailableFormats();
    res.json({
      success: true,
      data: formats
    });
  } catch (error) {
    console.error('Error getting available formats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available formats',
      error: error.message
    });
  }
};

// Preview number with different formats
const previewNumberFormat = async (req, res) => {
  try {
    const { type } = req.params;
    const { format, prefix, separator, number_length } = req.body;
    
    if (!documentTypes.hasOwnProperty(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid document type: ${type}. Available types: ${Object.keys(documentTypes).join(', ')}`
      });
    }

    // Get current settings from database
    const getSettingsQuery = `
      SELECT * FROM number_generation_settings 
      WHERE document_type = ? AND is_active = 1
    `;
    
    const [rows] = await db.execute(getSettingsQuery, [type]);
    const settings = rows[0];

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: `Settings not found for document type: ${type}`
      });
    }

    // Create preview settings
    const previewSettings = {
      ...settings,
      format: format || settings.format,
      prefix: prefix || settings.prefix,
      separator: separator || settings.separator,
      number_length: number_length || settings.number_length
    };

    const previewNumber = generateFormattedNumber(previewSettings);

    res.json({
      success: true,
      data: {
        preview: previewNumber,
        settings: previewSettings,
        format_info: getAvailableFormats()[previewSettings.format]
      }
    });
  } catch (error) {
    console.error('Error previewing number format:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview number format',
      error: error.message
    });
  }
};

// Bulk update format for all document types
const updateAllFormats = async (req, res) => {
  try {
    const { format, separator, number_length } = req.body;
    
    const updateQuery = `
      UPDATE number_generation_settings 
      SET \`format\` = ?, \`separator\` = ?, number_length = ?, updated_at = CURRENT_TIMESTAMP
      WHERE is_active = 1
    `;
    
    await db.execute(updateQuery, [format, separator, number_length]);

    res.json({
      success: true,
      message: 'All document number formats updated successfully'
    });
  } catch (error) {
    console.error('Error updating all formats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update all formats',
      error: error.message
    });
  }
};

module.exports = {
  generateNumber,
  getNextNumber,
  resetCounter,
  getAllCounters,
  getNumberGenerationSettings,
  updateNumberGenerationSettings,
  getAvailableFormatsEndpoint,
  previewNumberFormat,
  updateAllFormats
};
