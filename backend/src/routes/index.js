// src/routes/index.js
const express = require('express');
const router = express.Router();
const serverRoutes = require('./serverRoutes');
const monitorRoutes = require('./monitorRoutes');
// const authRoutes = require('./authRoutes');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Public routes
// router.use('/auth', authRoutes);
router.use('/servers', serverRoutes);
router.use('/monitor', monitorRoutes);

// Protected routes
// router.use('/servers', authenticateJWT, serverRoutes);
// router.use('/monitor', authenticateJWT, monitorRoutes);

// Root route
router.get('/', (req, res) => {
  res.json({ 
    message: 'Server Monitor API',
    version: '1.0.0'
  });
});

module.exports = router;