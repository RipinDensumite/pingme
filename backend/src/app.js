// src/app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// API routes
app.use('/api', routes);

// For any request that doesn't match the above, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;