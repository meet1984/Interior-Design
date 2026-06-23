/**
 * Restrict routes to specific user roles
 * @param {...string} allowedRoles - Names of roles permitted to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }

    const userRole = req.user.role.name;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Your account role (${userRole}) does not have permission for this action. Please log out and log in with the correct account.`
      });
    }

    next();
  };
};

module.exports = {
  authorize,
  requireAdmin: authorize('admin'),
  requireManagerOrAdmin: authorize('admin', 'manager'),
  requireClient: authorize('client')
};
