// src/services/pingService.js
const { execSync } = require('child_process');
const tcpPing = require('tcp-ping');
const Server = require('../models/Server');
const PingLog = require('../models/PingLog');
const { getSetting } = require('../utils/settings');

/**
 * Ping a server and get response time
 * @param {string} serverIp - The IP address to ping
 * @returns {Object} - Status and response time
 */
exports.pingServer = async (serverIp) => {
  try {
    // First try ICMP ping (standard ping)
    try {
      const platform = process.platform;
      const pingCmd = platform === 'win32' 
        ? `ping -n 1 -w 1000 ${serverIp}`
        : `ping -c 1 -W 1 ${serverIp}`;
      
      const start = Date.now();
      execSync(pingCmd, { stdio: 'ignore' });
      const responseTime = Date.now() - start;
      
      return {
        status: 'up',
        responseTime,
        method: 'icmp'
      };
    } catch (icmpError) {
      // If ICMP fails, try TCP ping to port 80
      return new Promise((resolve) => {
        tcpPing.ping({
          address: serverIp,
          port: 80,
          attempts: 1,
          timeout: 1000
        }, (err, data) => {
          if (err || !data.avg) {
            resolve({
              status: 'down',
              responseTime: null,
              method: 'tcp'
            });
          } else {
            resolve({
              status: 'up',
              responseTime: Math.round(data.avg),
              method: 'tcp'
            });
          }
        });
      });
    }
  } catch (error) {
    console.error(`Error pinging server ${serverIp}:`, error);
    return {
      status: 'error',
      responseTime: null,
      method: 'none',
      error: error.message
    };
  }
};

/**
 * Ping all active servers and optionally log results
 */
exports.pingAllServers = async () => {
  try {
    const servers = await Server.getAllActive();
    const enableLogs = await getSetting('enable_ping_logs') === 'true';
    const results = [];

    for (const server of servers) {
      const pingResult = await this.pingServer(server.ip_address);
      
      // Save log if logging is enabled
      if (enableLogs) {
        await PingLog.create({
          server_id: server.id,
          status: pingResult.status,
          response_time: pingResult.responseTime
        });
      }
      
      results.push({
        server,
        ping: pingResult
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error in pingAllServers:', error);
    throw error;
  }
};

/**
 * Get ping history for a server
 * @param {number} serverId - The server ID
 * @param {number} limit - Maximum number of records to return
 */
exports.getPingHistory = async (serverId, limit = 100) => {
  try {
    return await PingLog.getByServerId(serverId, limit);
  } catch (error) {
    console.error(`Error getting ping history for server ${serverId}:`, error);
    throw error;
  }
};