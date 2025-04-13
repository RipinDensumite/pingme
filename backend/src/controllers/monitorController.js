// src/controllers/monitorController.js
const pingService = require("../services/pingService");
const speedService = require("../services/speedService");
const PingLog = require("../models/PingLog");
const SpeedLog = require("../models/SpeedLog");
const { getSetting, updateSetting } = require("../utils/settings");

// Run ping test on all active servers
exports.pingAllServers = async (req, res, next) => {
  try {
    const results = await pingService.pingAllServers();
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

// Run ping test on a specific server
exports.pingServer = async (req, res, next) => {
  try {
    const serverId = req.params.id;

    // Get server IP
    const db = require("../config/database");
    const server = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM servers WHERE id = ?", [serverId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!server) {
      return res
        .status(404)
        .json({ success: false, error: "Server not found" });
    }

    const pingResult = await pingService.pingServer(server.ip_address);

    // Log result if enabled
    const enableLogs = (await getSetting("enable_ping_logs")) === "true";
    if (enableLogs) {
      await PingLog.create({
        server_id: serverId,
        status: pingResult.status,
        response_time: pingResult.responseTime,
      });
    }

    res.json({
      success: true,
      data: {
        server,
        ping: pingResult,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get ping history for a server
exports.getPingHistory = async (req, res, next) => {
  try {
    const serverId = req.params.id;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;

    const history = await pingService.getPingHistory(serverId, limit);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

// Run speed test on all active servers
exports.speedTestAllServers = async (req, res, next) => {
  try {
    const results = await speedService.testAllServers();
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

// Run speed test on a specific server
exports.speedTestServer = async (req, res, next) => {
  try {
    // src/controllers/monitorController.js (continued)
    const serverId = req.params.id;

    // Get server IP
    const db = require("../config/database");
    const server = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM servers WHERE id = ?", [serverId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!server) {
      return res
        .status(404)
        .json({ success: false, error: "Server not found" });
    }

    const speedResult = await speedService.testSpeed(server.ip_address);

    // Log result if enabled
    const enableLogs = (await getSetting("enable_speed_logs")) === "true";
    if (enableLogs) {
      await SpeedLog.create({
        server_id: serverId,
        download_speed: speedResult.downloadSpeed,
        upload_speed: speedResult.uploadSpeed,
        latency: speedResult.latency,
      });
    }

    res.json({
      success: true,
      data: {
        server,
        speed: speedResult,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get speed test history for a server
exports.getSpeedHistory = async (req, res, next) => {
  try {
    const serverId = req.params.id;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;

    const history = await speedService.getSpeedHistory(serverId, limit);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

// Get settings
exports.getSettings = async (req, res, next) => {
  try {
    const db = require("../config/database");
    const settings = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM settings", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Convert to object for easier access
    const settingsObj = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    res.json({ success: true, data: settingsObj });
  } catch (err) {
    next(err);
  }
};

// Update settings
exports.updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;

    // Validate settings
    const validSettings = [
      "enable_ping_logs",
      "enable_speed_logs",
      "ping_interval",
      "speed_interval",
    ];

    for (const key in updates) {
      if (!validSettings.includes(key)) {
        return res.status(400).json({
          success: false,
          error: `Invalid setting: ${key}`,
        });
      }
    }

    // Update each setting
    const db = require("../config/database");
    for (const key in updates) {
      await new Promise((resolve, reject) => {
        db.run(
          "UPDATE settings SET value = ? WHERE key = ?",
          [updates[key], key],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    next(err);
  }
};
