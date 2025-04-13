// src/config/database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database initialization
const dbPath = path.resolve(__dirname, "../../database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
    initializeDatabase();
  }
});

// Create tables if they don't exist
function initializeDatabase() {
  // Servers table
  db.run(`
    CREATE TABLE IF NOT EXISTS servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ping logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS ping_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER,
      status TEXT NOT NULL,
      response_time INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (server_id) REFERENCES servers(id)
    )
  `);

  // Speed test logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS speed_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER,
      download_speed REAL,
      upload_speed REAL,
      latency INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (server_id) REFERENCES servers(id)
    )
  `);

  // Users table for authentication
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description TEXT
    )
  `);

  // Insert default settings
  db.run(`
    INSERT OR IGNORE INTO settings (key, value, description)
    VALUES 
      ('enable_ping_logs', 'false', 'Enable logging of ping results'),
      ('enable_speed_logs', 'false', 'Enable logging of speed test results'),
      ('ping_interval', '60', 'Ping interval in seconds'),
      ('speed_interval', '3600', 'Speed test interval in seconds')
  `);
}

module.exports = db;
