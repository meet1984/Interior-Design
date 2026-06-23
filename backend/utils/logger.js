const { db } = require('../models');

/**
 * Log user activity to the database.
 * @param {number|null} userId - The user ID executing the action
 * @param {string} action - Action identifier (e.g. 'product_created')
 * @param {object|string|null} details - Action detail payload (will be stringified if object)
 * @param {object|null} req - Express request object (to extract IP address)
 */
const logActivity = async (userId, action, details = null, req = null) => {
  try {
    let ipAddress = '127.0.0.1';
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    }
    
    let detailsStr = details;
    if (details && typeof details === 'object') {
      detailsStr = JSON.stringify(details);
    }

    await db.ActivityLog.create({
      userId,
      action,
      details: detailsStr,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
};

module.exports = {
  logActivity
};
