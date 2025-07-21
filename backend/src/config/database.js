const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
require('dotenv').config();

let db;

// Determine database type based on environment
const isProduction = process.env.NODE_ENV === 'production';
const databaseType = process.env.DB_TYPE || (isProduction ? 'postgres' : 'mysql');

if (databaseType === 'postgres' || process.env.DATABASE_URL) {
  // PostgreSQL configuration (for production on Render)
  const pgConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  
  db = new Pool(pgConfig);
  
  // Test PostgreSQL connection
  db.query('SELECT NOW()')
    .then(() => {
      console.log('Connected to PostgreSQL database');
    })
    .catch(err => {
      console.error('Error connecting to PostgreSQL database:', err.message);
    });
    
} else {
  // MySQL configuration (for local development)
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'erp_user',
    password: process.env.DB_PASSWORD || 'erp_password123',
    database: process.env.DB_NAME || 'printsoft_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
  };
  
  db = mysql.createPool(dbConfig);
  
  // Test MySQL connection
  db.getConnection()
    .then(connection => {
      console.log('Connected to MySQL database');
      connection.release();
    })
    .catch(err => {
      console.error('Error connecting to MySQL database:', err.message);
    });
}

// Database wrapper functions to handle both MySQL and PostgreSQL
const dbWrapper = {
  async execute(query, params = []) {
    if (databaseType === 'postgres' || process.env.DATABASE_URL) {
      // Convert MySQL-style ? placeholders to PostgreSQL-style $1, $2, etc.
      let pgQuery = query;
      let paramIndex = 1;
      pgQuery = pgQuery.replace(/\?/g, () => `$${paramIndex++}`);
      
      const result = await db.query(pgQuery, params);
      return [result.rows, { insertId: result.rows[0]?.id }];
    } else {
      return await db.execute(query, params);
    }
  },
  
  async query(query, params = []) {
    if (databaseType === 'postgres' || process.env.DATABASE_URL) {
      let pgQuery = query;
      let paramIndex = 1;
      pgQuery = pgQuery.replace(/\?/g, () => `$${paramIndex++}`);
      
      const result = await db.query(pgQuery, params);
      return result.rows;
    } else {
      const [rows] = await db.execute(query, params);
      return rows;
    }
  }
};

module.exports = {
  db: dbWrapper,
  rawDb: db, // Raw connection for advanced use
  databaseType,
  uuidv4,
  bcrypt
};
