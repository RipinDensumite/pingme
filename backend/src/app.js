// src/app.js
const express = require("express");
const morgan = require("morgan");
const indexRoutes = require("./routes/index");
const errorHandler = require("./middleware/errorHandler");

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Logging

// Routes
app.use("/api", indexRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
