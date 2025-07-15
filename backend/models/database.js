const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();
const fs = require('fs');

// Use environment DB_PATH or default to /tmp for Render-safe directory
const dbPath = process.env.DB_PATH || path.join('/tmp', 'properties.db');

// Ensure directory exists (only for non-/tmp custom paths)
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
      } else {
        console.log(`✅ Connected to SQLite database at: ${dbPath}`);
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    // Properties table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(15,2) NOT NULL,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL CHECK(category IN ('lands', 'cars', 'apartments')),
        image_url VARCHAR(500),
        features TEXT,
        size VARCHAR(100),
        status VARCHAR(20) DEFAULT 'available' CHECK(status IN ('available', 'sold', 'pending')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, this._logResult('properties'));

    // Contact messages table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'replied')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, this._logResult('contact_messages'));

    // Admin users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating admin_users table:', err.message);
      } else {
        console.log('✅ admin_users table ready');
        this.createDefaultAdmin();
      }
    });
  }

  createDefaultAdmin() {
    const bcrypt = require('bcryptjs');
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    this.db.get('SELECT id FROM admin_users WHERE username = ?', [username], (err, row) => {
      if (err) {
        console.error('❌ Error checking admin user:', err.message);
        return;
      }

      if (!row) {
        const passwordHash = bcrypt.hashSync(password, 10);
        this.db.run(
          'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
          [username, passwordHash],
          (err) => {
            if (err) {
              console.error('❌ Error creating default admin:', err.message);
            } else {
              console.log(`✅ Default admin created: ${username}`);
            }
          }
        );
      }
    });
  }

  // Log table creation result
  _logResult(tableName) {
    return (err) => {
      if (err) {
        console.error(`❌ Error creating ${tableName} table:`, err.message);
      } else {
        console.log(`✅ ${tableName} table ready`);
      }
    };
  }

  // Promisified helpers
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) return reject(err);
        console.log('✅ Database connection closed');
        resolve();
      });
    });
  }
}

module.exports = new Database();
