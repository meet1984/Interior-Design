const { db } = require('../models');
const { logActivity } = require('../utils/logger');
const { Op } = require('sequelize');

// ==========================================
// DASHBOARD ANALYTICS
// ==========================================

const getDashboardStats = async (req, res) => {
  try {
    // 1. Core KPIs
    const totalUsers = await db.User.count();
    const totalClients = await db.User.count({
      include: [{ model: db.Role, as: 'role', where: { name: 'client' } }]
    });
    const totalManagers = await db.User.count({
      include: [{ model: db.Role, as: 'role', where: { name: 'manager' } }]
    });

    const totalProducts = await db.Product.count();
    const totalProjects = await db.Project.count();
    const totalInquiries = await db.Inquiry.count();
    const pendingInquiries = await db.Inquiry.count({ where: { status: 'pending' } });
    
    // 2. Product distribution by Category
    const categories = await db.Category.findAll({
      include: [{ model: db.Product, as: 'products', attributes: ['id'] }]
    });

    const categoryDistribution = categories.map(cat => ({
      name: cat.name,
      value: cat.products.length
    }));

    // 3. User growth placeholder data (structured for Recharts frontend rendering)
    const userGrowthData = [
      { month: 'Jan', clients: 5, managers: 1 },
      { month: 'Feb', clients: 12, managers: 2 },
      { month: 'Mar', clients: 20, managers: 2 },
      { month: 'Apr', clients: 32, managers: 3 },
      { month: 'May', clients: 45, managers: 4 },
      { month: 'Jun', clients: totalClients, managers: totalManagers }
    ];

    // 4. Recent activity log
    const recentActivity = await db.ActivityLog.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [{ model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }]
    });

    // 5. Inquiry trends
    const inquiryTrends = [
      { name: 'Pending', value: pendingInquiries },
      { name: 'In Discussion', value: await db.Inquiry.count({ where: { status: 'in_discussion' } }) },
      { name: 'Resolved', value: await db.Inquiry.count({ where: { status: 'resolved' } }) },
      { name: 'Closed', value: await db.Inquiry.count({ where: { status: 'closed' } }) }
    ];

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          totalClients,
          totalManagers,
          totalProducts,
          totalProjects,
          totalInquiries,
          pendingInquiries
        },
        categoryDistribution,
        userGrowthData,
        inquiryTrends,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Analytics stats fetch error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating dashboard analytics' });
  }
};

// ==========================================
// USER / MANAGER MANAGEMENT
// ==========================================

const getUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      include: [{ model: db.Role, as: 'role' }],
      order: [['created_at', 'DESC']]
    });

    // Strip passwords before returning
    const sanitized = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      roleId: user.roleId,
      status: user.status,
      avatar: user.avatar,
      createdAt: user.createdAt
    }));

    return res.status(200).json({ success: true, count: sanitized.length, data: sanitized });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching user profiles' });
  }
};

const createUser = async (req, res) => {
  const { firstName, lastName, email, password, phone, roleName } = req.body;

  try {
    if (!firstName || !lastName || !email || !password || !roleName) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if role is valid (Admin can create Managers, Clients, or even another Admin)
    const targetRole = await db.Role.findOne({ where: { name: roleName } });
    if (!targetRole) {
      return res.status(400).json({ success: false, message: `Role '${roleName}' does not exist` });
    }

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address already in use' });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.User.create({
      roleId: targetRole.id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      status: 'active'
    });

    await logActivity(
      req.user.id, 
      'user_created_by_admin', 
      `Created user profile: ${email} with role ${roleName}`, 
      req
    );

    return res.status(201).json({
      success: true,
      message: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} user created successfully`,
      data: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: roleName,
        status: newUser.status
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating user' });
  }
};

const updateUserRoleOrStatus = async (req, res) => {
  const { roleName, status } = req.body;
  const userId = req.params.id;

  try {
    const user = await db.User.findByPk(userId, {
      include: [{ model: db.Role, as: 'role' }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent any modification of Admin accounts (status or role)
    if (user.role.name === 'admin') {
      return res.status(400).json({ success: false, message: 'Security Policy: Modifying Administrator accounts is strictly prohibited.' });
    }

    if (roleName) {
      const targetRole = await db.Role.findOne({ where: { name: roleName } });
      if (!targetRole) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      user.roleId = targetRole.id;
    }

    if (status) {
      user.status = status;
    }

    await user.save();

    await logActivity(
      req.user.id,
      'user_role_status_modified',
      `Modified user ID ${user.id} (${user.email}): role=${roleName || user.role.name}, status=${status || user.status}`,
      req
    );

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        role: roleName || user.role.name,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user settings error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating user configuration' });
  }
};

const deleteUser = async (req, res) => {
  const targetId = req.params.id;

  try {
    const user = await db.User.findByPk(targetId, {
      include: [{ model: db.Role, as: 'role' }]
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent any deletion of Admin accounts
    if (user.role.name === 'admin') {
      return res.status(400).json({ success: false, message: 'Security Policy: Deleting Administrator accounts is strictly prohibited.' });
    }

    const email = user.email;
    await user.destroy(); // Soft delete

    await logActivity(req.user.id, 'user_deleted_by_admin', `Soft-deleted user profile: ${email}`, req);

    return res.status(200).json({ success: true, message: `User "${email}" soft deleted successfully.` });
  } catch (error) {
    console.error('Delete user profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting user profile' });
  }
};

// ==========================================
// SYSTEM SETTINGS & AUDIT LOGS
// ==========================================

const getSystemSettings = async (req, res) => {
  try {
    const settings = await db.Setting.findAll();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching system settings' });
  }
};

const updateSystemSettings = async (req, res) => {
  const { settings } = req.body; // Expecting object of key-value pairs

  try {
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid payload. Settings must be an object.' });
    }

    for (const [key, value] of Object.entries(settings)) {
      const existingSetting = await db.Setting.findOne({ where: { key } });
      if (existingSetting) {
        await existingSetting.update({ value });
      } else {
        await db.Setting.create({ key, value });
      }
    }

    await logActivity(req.user.id, 'settings_updated', 'Updated system settings values', req);

    const updated = await db.Setting.findAll();
    return res.status(200).json({ success: true, message: 'System settings updated successfully', data: updated });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating system settings' });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const logs = await db.ActivityLog.findAll({
      limit: 100,
      order: [['created_at', 'DESC']],
      include: [{ model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
    });

    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error('Fetch activity logs error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching activity logs' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUserRoleOrStatus,
  deleteUser,
  getSystemSettings,
  updateSystemSettings,
  getActivityLogs
};
