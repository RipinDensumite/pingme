// src/models/User.js
const db = require("../config/database");

class User {
  static getAll(callback) {
    if (callback) {
      return db.all(
        "SELECT id, username, is_admin, created_at FROM users",
        [],
        callback
      );
    }

    return new Promise((resolve, reject) => {
      db.all(
        "SELECT id, username, is_admin, created_at FROM users",
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
      return db.get(
        "SELECT id, username, is_admin, created_at FROM users WHERE id = ?",
        [id],
        callback
      );
    }

    return new Promise((resolve, reject) => {
      db.get(
        "SELECT id, username, is_admin, created_at FROM users WHERE id = ?",
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static getByUsername(username, callback) {
    if (callback) {
      return db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        callback
      );
    }

    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static create(user, callback) {
    const { username, password, is_admin } = user;

    if (callback) {
      return db.run(
        "INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)",
        [username, password, is_admin ? 1 : 0],
        callback
      );
    }

    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)",
        [username, password, is_admin ? 1 : 0],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, username, is_admin });
        }
      );
    });
  }

  static update(id, user, callback) {
    const { username, password, is_admin } = user;
    let query, params;

    if (password) {
      query =
        "UPDATE users SET username = ?, password = ?, is_admin = ? WHERE id = ?";
      params = [username, password, is_admin ? 1 : 0, id];
    } else {
      query = "UPDATE users SET username = ?, is_admin = ? WHERE id = ?";
      params = [username, is_admin ? 1 : 0, id];
    }

    if (callback) {
      return db.run(query, params, callback);
    }

    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  static delete(id, callback) {
    if (callback) {
      return db.run("DELETE FROM users WHERE id = ?", [id], callback);
    }

    return new Promise((resolve, reject) => {
      db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
}

module.exports = User;
