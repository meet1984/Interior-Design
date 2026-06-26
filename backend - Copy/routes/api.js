const express = require('express');
const router = express.Router();

const { db } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin, requireManagerOrAdmin, requireClient } = require('../middleware/rbacMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Controllers
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const projectController = require('../controllers/projectController');
const inquiryController = require('../controllers/inquiryController');
const favoriteController = require('../controllers/favoriteController');
const testimonialController = require('../controllers/testimonialController');
const adminController = require('../controllers/adminController');
const contentController = require('../controllers/contentController');

// Helper middleware to allow optional authentication on public-facing routes
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/register', authController.register);
router.post('/auth/verify-registration', authController.verifyRegistrationOtp);
router.post('/auth/resend-otp', authController.resendOtp);
router.post('/auth/login', authController.login);
router.post('/auth/verify-login-otp', authController.verifyLoginOtp);
router.get('/auth/profile', protect, authController.getProfile);
router.post('/auth/profile/request-otp', protect, authController.requestProfileUpdateOtp);
router.put('/auth/profile', protect, upload.single('avatar'), authController.updateProfile);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/logout', optionalProtect, authController.logout);

// ==========================================
// PUBLIC CONTENT ROUTES
// ==========================================
router.get('/public/content', contentController.getPublicContent);

// ==========================================
// CATEGORY ROUTES
// ==========================================
router.get('/categories', optionalProtect, productController.getCategories);
router.get('/categories/:slug', optionalProtect, productController.getCategoryBySlug);
router.post('/categories', protect, requireManagerOrAdmin, upload.single('image'), productController.createCategory);
router.put('/categories/:id', protect, requireManagerOrAdmin, upload.single('image'), productController.updateCategory);
router.delete('/categories/:id', protect, requireManagerOrAdmin, productController.deleteCategory);

// ==========================================
// COLLECTION ROUTES
// ==========================================
router.get('/collections', optionalProtect, productController.getCollections);
router.get('/collections/:slug', optionalProtect, productController.getCollectionBySlug);
router.post('/collections', protect, requireManagerOrAdmin, upload.single('image'), productController.createCollection);
router.put('/collections/:id', protect, requireManagerOrAdmin, upload.single('image'), productController.updateCollection);
router.delete('/collections/:id', protect, requireManagerOrAdmin, productController.deleteCollection);

// ==========================================
// PRODUCT ROUTES
// ==========================================
router.get('/products', optionalProtect, productController.getProducts);
router.get('/products/:slug', optionalProtect, productController.getProductBySlug);
router.post('/products', protect, requireManagerOrAdmin, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), productController.createProduct);
router.put('/products/:id', protect, requireManagerOrAdmin, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), productController.updateProduct);
router.delete('/products/:id', protect, requireManagerOrAdmin, productController.deleteProduct);

// ==========================================
// INTERIOR PROJECT ROUTES
// ==========================================
router.get('/projects', optionalProtect, projectController.getProjects);
router.get('/projects/:slug', optionalProtect, projectController.getProjectBySlug);
router.post('/projects', protect, requireManagerOrAdmin, upload.array('media', 10), projectController.createProject);
router.put('/projects/:id', protect, requireManagerOrAdmin, upload.array('media', 10), projectController.updateProject);
router.delete('/projects/:id', protect, requireManagerOrAdmin, projectController.deleteProject);
router.delete('/projects/media/:mediaId', protect, requireManagerOrAdmin, projectController.deleteProjectMedia);

// ==========================================
// GALLERY ROUTES
// ==========================================
router.get('/gallery', optionalProtect, async (req, res, next) => {
  try {
    const filter = req.user && ['admin', 'manager'].includes(req.user.role.name) ? {} : { status: 'active' };
    const items = await db.Gallery.findAll({
      where: filter,
      include: [{ model: db.Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
});

router.post('/gallery', protect, requireManagerOrAdmin, upload.single('image'), async (req, res, next) => {
  const { title, description, categoryId } = req.body;
  try {
    if (!title || !req.file) {
      return res.status(400).json({ success: false, message: 'Title and image file are required' });
    }
    const item = await db.Gallery.create({
      title,
      description,
      categoryId: categoryId || null,
      filePath: `/uploads/${req.file.filename}`,
      mediaType: 'image',
      status: 'active'
    });
    return res.status(201).json({ success: true, message: 'Gallery item created successfully', data: item });
  } catch (err) {
    next(err);
  }
});

router.delete('/gallery/:id', protect, requireManagerOrAdmin, async (req, res, next) => {
  try {
    const item = await db.Gallery.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }
    await item.destroy();
    return res.status(200).json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// INQUIRY ROUTES
// ==========================================
router.get('/inquiries', protect, inquiryController.getInquiries);
router.post('/inquiries', optionalProtect, inquiryController.createInquiry);
router.put('/inquiries/:id', protect, requireManagerOrAdmin, inquiryController.updateInquiryStatus);

// ==========================================
// CLIENT FAVORITE ROUTES
// ==========================================
router.get('/favorites', protect, requireClient, favoriteController.getFavorites);
router.post('/favorites', protect, requireClient, favoriteController.toggleFavorite);

// ==========================================
// TESTIMONIAL ROUTES
// ==========================================
router.get('/testimonials', optionalProtect, testimonialController.getTestimonials);
router.post('/testimonials', optionalProtect, testimonialController.createTestimonial);
router.put('/testimonials/:id/status', protect, requireAdmin, testimonialController.approveTestimonial);
router.delete('/testimonials/:id', protect, requireAdmin, testimonialController.deleteTestimonial);

// ==========================================
// ADMIN DASHBOARD & SYSTEM SETTINGS
// ==========================================
router.get('/admin/stats', protect, requireAdmin, adminController.getDashboardStats);
router.get('/admin/users', protect, requireAdmin, adminController.getUsers);
router.post('/admin/users', protect, requireAdmin, adminController.createUser);
router.put('/admin/users/:id', protect, requireAdmin, adminController.updateUserRoleOrStatus);
router.delete('/admin/users/:id', protect, requireAdmin, adminController.deleteUser);
router.get('/admin/settings', protect, requireAdmin, adminController.getSystemSettings);
router.put('/admin/settings', protect, requireAdmin, adminController.updateSystemSettings);
router.get('/admin/logs', protect, requireAdmin, adminController.getActivityLogs);

router.get('/admin/services', protect, requireAdmin, contentController.getAdminServices);
router.post('/admin/services', protect, requireAdmin, upload.single('icon'), contentController.createService);
router.put('/admin/services/reorder', protect, requireAdmin, contentController.reorderServices);
router.put('/admin/services/:id', protect, requireAdmin, upload.single('icon'), contentController.updateService);
router.delete('/admin/services/:id', protect, requireAdmin, contentController.deleteService);
router.put('/admin/content/about', protect, requireAdmin, contentController.updateAboutContent);

// Public settings route for the website footer and contact pages
router.get('/settings', adminController.getSystemSettings);

// ==========================================
// STAFF USER UTILITIES (Manager & Admin)
// ==========================================
router.get('/users/staff', protect, requireManagerOrAdmin, async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const staffUsers = await db.User.findAll({
      include: [{ 
        model: db.Role, 
        as: 'role',
        where: { name: { [Op.in]: ['admin', 'manager'] } }
      }],
      order: [['first_name', 'ASC']]
    });

    const sanitized = staffUsers.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.name
    }));

    return res.status(200).json({ success: true, count: sanitized.length, data: sanitized });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
