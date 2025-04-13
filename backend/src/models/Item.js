// src/models/Item.js
const db = require("../config/database");

class Item {
  static getAll(callback) {
    return db.all("SELECT * FROM items", [], callback);
  }

  static getById(id, callback) {
    return db.get("SELECT * FROM items WHERE id = ?", [id], callback);
  }

  static create(item, callback) {
    return db.run(
      "INSERT INTO items (name, description) VALUES (?, ?)",
      [item.name, item.description],
      callback
    );
  }

  static update(id, item, callback) {
    return db.run(
      "UPDATE items SET name = ?, description = ? WHERE id = ?",
      [item.name, item.description, id],
      callback
    );
  }

  static delete(id, callback) {
    return db.run("DELETE FROM items WHERE id = ?", [id], callback);
  }
}

module.exports = Item;
