// src/models/PingLog.js
const db = require("../config/database");

class PingLog {
  static getAll(limit = 1000, callback) {
    const query = `
      SELECT pl.*, s.name as server_name, s.ip_address 
      FROM ping_logs pl
      JOIN servers s ON pl.server_id = s.id
      ORDER BY pl.timestamp DESC
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
      SELECT * FROM ping_logs 
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

  static create(pingLog, callback) {
    const { server_id, status, response_time } = pingLog;

    if (callback) {
      return db.run(
        "INSERT INTO ping_logs (server_id, status, response_time) VALUES (?, ?, ?)",
        [server_id, status, response_time],
        callback
      );
    }

    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO ping_logs (server_id, status, response_time) VALUES (?, ?, ?)",
        [server_id, status, response_time],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...pingLog });
        }
      );
    });
  }

  static deleteOlderThan(days, callback) {
    const query = `
      DELETE FROM ping_logs 
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

module.exports = PingLog;
