// src/controllers/itemController.js
const Item = require("../models/Item");

// Get all items
exports.getAllItems = (req, res, next) => {
  Item.getAll((err, rows) => {
    if (err) {
      return next(err);
    }
    res.json({ data: rows });
  });
};

// Get item by id
exports.getItemById = (req, res, next) => {
  const id = req.params.id;
  Item.getById(id, (err, row) => {
    if (err) {
      return next(err);
    }
    if (!row) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ data: row });
  });
};

// Create new item
exports.createItem = (req, res, next) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  Item.create({ name, description }, function (err) {
    if (err) {
      return next(err);
    }

    res.status(201).json({
      message: "Item created successfully",
      data: { id: this.lastID, name, description },
    });
  });
};

// Update item
exports.updateItem = (req, res, next) => {
  const id = req.params.id;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  Item.update(id, { name, description }, function (err) {
    if (err) {
      return next(err);
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item updated successfully" });
  });
};

// Delete item
exports.deleteItem = (req, res, next) => {
  const id = req.params.id;

  Item.delete(id, function (err) {
    if (err) {
      return next(err);
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  });
};
