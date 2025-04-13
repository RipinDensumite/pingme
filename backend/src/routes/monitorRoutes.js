// src/routes/monitorRoutes.js
const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');

// Ping routes
router.get('/ping', monitorController.pingAllServers);
router.get('/ping/:id', monitorController.pingServer);
router.get('/ping/:id/history', monitorController.getPingHistory);

// Speed test routes
router.get('/speed', monitorController.speedTestAllServers);
router.get('/speed/:id', monitorController.speedTestServer);
router.get('/speed/:id/history', monitorController.getSpeedHistory);

// Settings routes
router.get('/settings', monitorController.getSettings);
router.put('/settings', monitorController.updateSettings);

module.exports = router;