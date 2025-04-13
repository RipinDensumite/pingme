// src/utils/settings.js
const db = require('../config/database');

/**
 * Get a setting value by key
 * @param {string} key - The setting key
 * @returns {Promise<string>} - The setting value
 */
exports.getSetting = async (key) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(null);
      } else {
        resolve(row.value);
      }
    });
  });
};

/**
 * Update a setting value
 * @param {string} key - The setting key
 * @param {string} value - The new value
 * @returns {Promise<void>}
 */
exports.updateSetting = async (key, value) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE settings SET value = ? WHERE key = ?',
      [value, key],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      }
    );
  });
};

/**
 * Get all settings
 * @returns {Promise<Array>} - Array of setting objects
 */
exports.getAllSettings = async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM settings', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};