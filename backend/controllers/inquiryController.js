const { db } = require('../models');
const { logActivity } = require('../utils/logger');
const { Op } = require('sequelize');

const getInquiries = async (req, res) => {
  try {
    const userRole = req.user.role.name;
    let filter = {};

    // Clients can only view their own inquiries
    if (userRole === 'client') {
      filter = { userId: req.user.id };
    } else if (userRole === 'manager') {
      // Managers see ONLY inquiries assigned to them
      filter = { assignedTo: req.user.id };
    } // Admins see all (filter remains {})

    const inquiries = await db.Inquiry.findAll({
      where: filter,
      include: [
        { model: db.Product, as: 'product', attributes: ['id', 'title', 'slug', 'thumbnail'] },
        { model: db.User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: db.User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    console.error('Fetch inquiries error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching inquiries' });
  }
};

const createInquiry = async (req, res) => {
  const { name, email, phone, subject, message, inquiryType, productId } = req.body;

  try {
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Name, Email, Subject, and Message are required' });
    }

    // Connect to user if logged in
    const userId = req.user ? req.user.id : null;

    // Check if product exists if linked
    if (productId) {
      const product = await db.Product.findByPk(productId);
      if (!product) {
        return res.status(400).json({ success: false, message: 'Target product not found' });
      }
    }

    const inquiry = await db.Inquiry.create({
      userId,
      name,
      email,
      phone,
      subject,
      message,
      inquiryType: inquiryType || 'general',
      productId: productId || null,
      status: 'pending'
    });

    if (userId) {
      await logActivity(userId, 'inquiry_submitted', `Submitted ${inquiryType} inquiry: ${subject}`, req);
    }

    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. Our design team will contact you shortly.',
      data: inquiry
    });
  } catch (error) {
    console.error('Submit inquiry error:', error);
    return res.status(500).json({ success: false, message: 'Server error submitting inquiry' });
  }
};

const updateInquiryStatus = async (req, res) => {
  const { status, assignedTo } = req.body;

  try {
    const inquiry = await db.Inquiry.findByPk(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (status) inquiry.status = status;
    
    if (assignedTo !== undefined) {
      if (req.user.role.name !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only administrators can assign inquiries.' });
      }

      if (assignedTo !== null) {
        const staff = await db.User.findByPk(assignedTo, {
          include: [{ model: db.Role, as: 'role' }]
        });
        if (!staff || !['admin', 'manager'].includes(staff.role.name)) {
          return res.status(400).json({ success: false, message: 'Assigned staff must be an Admin or Manager' });
        }
      }
      inquiry.assignedTo = assignedTo;
    }

    await inquiry.save();

    await logActivity(
      req.user.id, 
      'inquiry_updated', 
      `Updated inquiry ID ${inquiry.id}: status=${status}, assignedTo=${assignedTo}`, 
      req
    );

    return res.status(200).json({ success: true, message: 'Inquiry updated successfully', data: inquiry });
  } catch (error) {
    console.error('Update inquiry error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating inquiry' });
  }
};

module.exports = {
  getInquiries,
  createInquiry,
  updateInquiryStatus
};
