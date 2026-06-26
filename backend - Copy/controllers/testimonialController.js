const { db } = require('../models');
const { logActivity } = require('../utils/logger');

const getTestimonials = async (req, res) => {
  try {
    const filter = req.user && ['admin', 'manager'].includes(req.user.role.name) ? {} : { status: 'approved' };
    
    const testimonials = await db.Testimonial.findAll({
      where: filter,
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    console.error('Fetch testimonials error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching testimonials' });
  }
};

const createTestimonial = async (req, res) => {
  const { rating, content, clientName, clientTitle } = req.body;

  try {
    if (!content) {
      return res.status(400).json({ success: false, message: 'Testimonial content is required' });
    }

    // Identify details from req.user if client is logged in
    const userId = req.user ? req.user.id : null;
    const finalClientName = clientName || (req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Anonymous Client');
    const finalClientTitle = clientTitle || (req.user ? 'Verified Client' : 'Visitor');
    const finalAvatar = req.user ? req.user.avatar : null;

    const testimonial = await db.Testimonial.create({
      userId,
      clientName: finalClientName,
      clientTitle: finalClientTitle,
      avatar: finalAvatar,
      rating: rating ? parseInt(rating) : 5,
      content,
      status: 'approved' // Automatically approved as requested by user
    });

    if (userId) {
      await logActivity(userId, 'testimonial_submitted', 'Submitted a client review', req);
    }

    return res.status(201).json({
      success: true,
      message: 'Testimonial submitted and published successfully. Thank you for your review!',
      data: testimonial
    });
  } catch (error) {
    console.error('Submit testimonial error:', error);
    return res.status(500).json({ success: false, message: 'Server error submitting testimonial' });
  }
};

const approveTestimonial = async (req, res) => {
  const { status } = req.body; // approved, rejected

  try {
    const testimonial = await db.Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status parameter' });
    }

    testimonial.status = status;
    await testimonial.save();

    await logActivity(
      req.user.id, 
      'testimonial_status_updated', 
      `Updated testimonial ID ${testimonial.id} status to ${status}`, 
      req
    );

    return res.status(200).json({ success: true, message: `Testimonial status set to ${status}`, data: testimonial });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating testimonial' });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await db.Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    await testimonial.destroy();

    await logActivity(
      req.user.id,
      'testimonial_deleted',
      `Deleted testimonial ID ${req.params.id}`,
      req
    );

    return res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting testimonial' });
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  approveTestimonial,
  deleteTestimonial
};
