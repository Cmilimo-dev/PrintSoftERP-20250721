const { db, uuidv4, bcrypt } = require('../config/database');

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create companies table first
    await db.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        subscription_plan ENUM('trial', 'monthly', 'yearly') DEFAULT 'trial',
        subscription_status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
        trial_end_date TIMESTAMP NULL,
        subscription_end_date TIMESTAMP NULL,
        invite_token VARCHAR(100) UNIQUE,
        max_users INT DEFAULT 5,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role ENUM('super_admin', 'company_admin', 'manager', 'user', 'viewer') DEFAULT 'user',
        user_type ENUM('primary', 'sub_user') DEFAULT 'primary',
        company_id VARCHAR(36),
        is_active BOOLEAN DEFAULT TRUE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Create roles table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        permissions JSON,
        is_system_role BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create permissions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        module VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_roles table (many-to-many)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        role_id VARCHAR(36) NOT NULL,
        assigned_by VARCHAR(36),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE(user_id, role_id)
      )
    `);

    // Create number_generation_settings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS number_generation_settings (
        id VARCHAR(36) PRIMARY KEY,
        document_type VARCHAR(100) UNIQUE NOT NULL,
        prefix VARCHAR(10) DEFAULT '',
        suffix VARCHAR(10) DEFAULT '',
        next_number INT DEFAULT 1,
        number_length INT DEFAULT 6,
        \`separator\` VARCHAR(5) DEFAULT '-',
        \`format\` VARCHAR(50) DEFAULT 'prefix-number',
        auto_increment BOOLEAN DEFAULT TRUE,
        reset_frequency VARCHAR(20) DEFAULT 'never',
        last_reset_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create document_sequences table for tracking generated numbers
    await db.execute(`
      CREATE TABLE IF NOT EXISTS document_sequences (
        id VARCHAR(36) PRIMARY KEY,
        document_type VARCHAR(100) NOT NULL,
        document_number VARCHAR(100) NOT NULL,
        sequence_number INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_type) REFERENCES number_generation_settings(document_type) ON DELETE CASCADE
      )
    `);

    // Settings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(36) PRIMARY KEY,
        \`key\` VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // User Settings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        \`key\` VARCHAR(255) NOT NULL,
        value TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, \`key\`)
      )
    `);

    // User Profiles table for extended profile information
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE NOT NULL,
        avatar_url VARCHAR(500),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
        language VARCHAR(10) DEFAULT 'en',
        date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
        time_format VARCHAR(10) DEFAULT '24h',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Initialize number generation settings with default values
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

    // Populate number generation settings
    for (const [type, config] of Object.entries(documentTypes)) {
      await db.execute(`
        INSERT IGNORE INTO number_generation_settings 
        (id, document_type, prefix, next_number, number_length, \`format\`, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [uuidv4(), type, config.prefix, config.defaultStart, 6, 'prefix-timestamp', config.description]);
    }

    console.log('Database tables initialized successfully');
    console.log('Number generation settings initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = {
  initializeDatabase
};
