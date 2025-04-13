// src/models/SpeedLog.js
const db = require("../config/database");

class SpeedLog {
  static getAll(limit = 1000, callback) {
    const query = `
      SELECT sl.*, s.name as server_name, s.ip_address 
      FROM speed_logs sl
      JOIN servers s ON sl.server_id = s.id
      ORDER BY sl.timestamp DESC
      LIMIT ?
    `;

    if (callback) {
      return db.all(query, [limit], callback);
    }

    return new Promise((resolve, reject) => {
      db.all(query, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getByServerId(serverId, limit = 100, callback) {
    const query = `
      SELECT * FROM speed_logs 
      WHERE server_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;

    if (callback) {
      return db.all(query, [serverId, limit], callback);
    }

    return new Promise((resolve, reject) => {
      db.all(query, [serverId, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static create(speedLog, callback) {
    const { server_id, download_speed, upload_speed, latency } = speedLog;

    if (callback) {
      return db.run(
        "INSERT INTO speed_logs (server_id, download_speed, upload_speed, latency) VALUES (?, ?, ?, ?)",
        [server_id, download_speed, upload_speed, latency],
        callback
      );
    }

    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO speed_logs (server_id, download_speed, upload_speed, latency) VALUES (?, ?, ?, ?)",
        [server_id, download_speed, upload_speed, latency],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...speedLog });
        }
      );
    });
  }

  static deleteOlderThan(days, callback) {
    const query = `
      DELETE FROM speed_logs 
      WHERE timestamp < datetime('now', '-' || ? || ' days')
    `;

    if (callback) {
      return db.run(query, [days], callback);
    }

    return new Promise((resolve, reject) => {
      db.run(query, [days], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
}

module.exports = SpeedLog;
