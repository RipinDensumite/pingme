// src/controllers/serverController.js
const Server = require("../models/Server");

// Get all servers
exports.getAllServers = async (req, res, next) => {
  try {
    const servers = await Server.getAll();
    res.json({ success: true, data: servers });
  } catch (err) {
    next(err);
  }
};

// Get a specific server
exports.getServerById = async (req, res, next) => {
  try {
    const serverId = req.params.id;
    const server = await Server.getById(serverId);

    if (!server) {
      return res
        .status(404)
        .json({ success: false, error: "Server not found" });
    }

    res.json({ success: true, data: server });
  } catch (err) {
    next(err);
  }
};

// Create a new server
exports.createServer = async (req, res, next) => {
  try {
    const { name, ip_address, description, is_active } = req.body;

    if (!name || !ip_address) {
      return res.status(400).json({
        success: false,
        error: "Name and IP address are required",
      });
    }

    // Basic IP address validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip_address)) {
      return res.status(400).json({
        success: false,
        error: "Invalid IP address format",
      });
    }

    const server = await Server.create({
      name,
      ip_address,
      description,
      is_active,
    });

    res.status(201).json({
      success: true,
      message: "Server created successfully",
      data: server,
    });
  } catch (err) {
    next(err);
  }
};

// Update a server
exports.updateServer = async (req, res, next) => {
  try {
    const serverId = req.params.id;
    const { name, ip_address, description, is_active } = req.body;

    if (!name || !ip_address) {
      return res.status(400).json({
        success: false,
        error: "Name and IP address are required",
      });
    }

    // Check if server exists
    const existingServer = await Server.getById(serverId);
    if (!existingServer) {
      return res
        .status(404)
        .json({ success: false, error: "Server not found" });
    }

    // Basic IP address validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip_address)) {
      return res.status(400).json({
        success: false,
        error: "Invalid IP address format",
      });
    }

    const result = await Server.update(serverId, {
      name,
      ip_address,
      description,
      is_active,
    });

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Server not found" });
    }

    res.json({ success: true, message: "Server updated successfully" });
  } catch (err) {
    next(err);
  }
};

// Delete a server
exports.deleteServer = async (req, res, next) => {
  try {
    const serverId = req.params.id;

    // Check if server exists
    const existingServer = await Server.getById(serverId);
    if (!existingServer) {
      return res
        .status(404)
        .json({ success: false, error: "Server not found" });
    }

    const result = await Server.delete(serverId);

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Server not found" });
    }

    res.json({ success: true, message: "Server deleted successfully" });
  } catch (err) {
    next(err);
  }
};
