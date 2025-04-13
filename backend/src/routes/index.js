// src/routes/index.js
const express = require("express");
const router = express.Router();
const itemRoutes = require("./itemRoutes");

// Welcome route
router.get("/", (req, res) => {
  res.json({ message: "Welcome to Express SQLite API" });
});

// Mount item routes
router.use("/items", itemRoutes);

module.exports = router;
