const { db, uuidv4, bcrypt } = require('./src/config/database');

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', ['admin@printsoft.com']);
    
    if (existingUsers.length > 0) {
      console.log('Admin user already exists!');
      
      // Update the existing admin user to ensure it has super admin privileges
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.execute(
        'UPDATE users SET password_hash = ?, role = ?, first_name = ?, last_name = ? WHERE email = ?',
        [hashedPassword, 'admin', 'Admin', 'User', 'admin@printsoft.com']
      );
      
      console.log('✅ Admin user updated with admin privileges');
      console.log('📧 Email: admin@printsoft.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: admin');
      
      process.exit(0);
    }

    // Create new admin user
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.execute(
      'INSERT INTO users (id, username, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [adminId, 'admin', 'admin@printsoft.com', hashedPassword, 'Admin', 'User', 'admin']
    );

    console.log('✅ Super Admin user created successfully!');
    console.log('📧 Email: admin@printsoft.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin');
    console.log('🆔 ID:', adminId);
    
    // Create admin user profile
    await db.execute(
      'INSERT INTO user_profiles (id, user_id, timezone, language, date_format, time_format) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), adminId, 'Africa/Nairobi', 'en', 'DD/MM/YYYY', '24h']
    );

    console.log('✅ Admin user profile created');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
