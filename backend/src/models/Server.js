// src/models/Server.js
const db = require("../config/database");

class Server {
  static getAll(callback) {
    if (callback) {
      return db.all("SELECT * FROM servers ORDER BY name", [], callback);
    }

    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM servers ORDER BY name", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getAllActive(callback) {
    if (callback) {
      return db.all(
        "SELECT * FROM servers WHERE is_active = 1 ORDER BY name",
        [],
        callback
      );
    }

    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM servers WHERE is_active = 1 ORDER BY name",
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static getById(id, callback) {
    if (callback) {
      return db.get("SELECT * FROM servers WHERE id = ?", [id], callback);
    }

    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM servers WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static create(server, callback) {
    const { name, ip_address, description, is_active } = server;

    if (callback) {
      return db.run(
        "INSERT INTO servers (name, ip_address, description, is_active) VALUES (?, ?, ?, ?)",
        [
          name,
          ip_address,
          description,
          is_active === undefined ? 1 : is_active ? 1 : 0,
        ],
        callback
      );
    }

    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO servers (name, ip_address, description, is_active) VALUES (?, ?, ?, ?)",
        [
          name,
          ip_address,
          description,
          is_active === undefined ? 1 : is_active ? 1 : 0,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...server });
        }
      );
    });
  }

  static update(id, server, callback) {
    const { name, ip_address, description, is_active } = server;

    if (callback) {
      return db.run(
        "UPDATE servers SET name = ?, ip_address = ?, description = ?, is_active = ? WHERE id = ?",
        [name, ip_address, description, is_active ? 1 : 0, id],
        callback
      );
    }

    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE servers SET name = ?, ip_address = ?, description = ?, is_active = ? WHERE id = ?",
        [name, ip_address, description, is_active ? 1 : 0, id],
        function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static delete(id, callback) {
    if (callback) {
      return db.run("DELETE FROM servers WHERE id = ?", [id], callback);
    }

    return new Promise((resolve, reject) => {
      db.run("DELETE FROM servers WHERE id = ?", [id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
}

module.exports = Server;
