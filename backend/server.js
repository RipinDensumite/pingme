// server.js
require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/database');
const pingService = require('./src/services/pingService');
const speedService = require('./src/services/speedService');
const { getSetting } = require('./src/utils/settings');

const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  setupBackgroundTasks();
});

// Setup background tasks for monitoring
async function setupBackgroundTasks() {
  try {
    // Setup ping interval
    const pingIntervalSetting = await getSetting('ping_interval');
    const pingInterval = parseInt(pingIntervalSetting, 10) || 60; // default 60 seconds
    
    setInterval(async () => {
      try {
        console.log('Running scheduled ping tests...');
        await pingService.pingAllServers();
      } catch (err) {
        console.error('Error running ping tests:', err);
      }
    }, pingInterval * 1000);
    
    // Setup speed test interval
    const speedIntervalSetting = await getSetting('speed_interval');
    const speedInterval = parseInt(speedIntervalSetting, 10) || 3600; // default 1 hour
    
    setInterval(async () => {
      try {
        console.log('Running scheduled speed tests...');
        await speedService.testAllServers();
      } catch (err) {
        console.error('Error running speed tests:', err);
      }
    }, speedInterval * 1000);
    
    console.log(`Background tasks setup: Ping every ${pingInterval}s, Speed test every ${speedInterval}s`);
  } catch (err) {
    console.error('Error setting up background tasks:', err);
  }
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});