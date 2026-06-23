const { initializeDatabase, getSequelize } = require('../config/db');

// Import model initializers
const initRole = require('./Role');
const initUser = require('./User');
const initCategory = require('./Category');
const initCollection = require('./Collection');
const initProduct = require('./Product');
const initProject = require('./Project');
const initProjectMedia = require('./ProjectMedia');
const initGallery = require('./Gallery');
const initInquiry = require('./Inquiry');
const initFavorite = require('./Favorite');
const initTestimonial = require('./Testimonial');
const initActivityLog = require('./ActivityLog');
const initSetting = require('./Setting');
const initService = require('./Service');

const db = {};

const setupModels = (sequelize) => {
  // 1. Initialize models
  db.Role = initRole(sequelize);
  db.User = initUser(sequelize);
  db.Category = initCategory(sequelize);
  db.Collection = initCollection(sequelize);
  db.Product = initProduct(sequelize);
  db.Project = initProject(sequelize);
  db.ProjectMedia = initProjectMedia(sequelize);
  db.Gallery = initGallery(sequelize);
  db.Inquiry = initInquiry(sequelize);
  db.Favorite = initFavorite(sequelize);
  db.Testimonial = initTestimonial(sequelize);
  db.ActivityLog = initActivityLog(sequelize);
  db.Setting = initSetting(sequelize);
  db.Otp = require('./Otp')(sequelize);
  db.Service = initService(sequelize);

  // 2. Define Associations

  // Roles <-> Users
  db.Role.hasMany(db.User, { foreignKey: 'roleId', as: 'users' });
  db.User.belongsTo(db.Role, { foreignKey: 'roleId', as: 'role' });

  // Categories <-> Collections
  db.Category.hasMany(db.Collection, { foreignKey: 'categoryId', as: 'collections', onDelete: 'CASCADE' });
  db.Collection.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

  // Categories <-> Products
  db.Category.hasMany(db.Product, { foreignKey: 'categoryId', as: 'products' });
  db.Product.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

  // Collections <-> Products
  db.Collection.hasMany(db.Product, { foreignKey: 'collectionId', as: 'products', onDelete: 'CASCADE' });
  db.Product.belongsTo(db.Collection, { foreignKey: 'collectionId', as: 'collection' });

  // Users (Creator) <-> Products
  db.User.hasMany(db.Product, { foreignKey: 'createdBy', as: 'createdProducts' });
  db.Product.belongsTo(db.User, { foreignKey: 'createdBy', as: 'creator' });

  // Users (Creator) <-> Projects
  db.User.hasMany(db.Project, { foreignKey: 'createdBy', as: 'createdProjects' });
  db.Project.belongsTo(db.User, { foreignKey: 'createdBy', as: 'creator' });

  // Projects <-> ProjectMedia
  db.Project.hasMany(db.ProjectMedia, { foreignKey: 'projectId', as: 'media', onDelete: 'CASCADE' });
  db.ProjectMedia.belongsTo(db.Project, { foreignKey: 'projectId', as: 'project' });

  // Categories <-> Gallery
  db.Category.hasMany(db.Gallery, { foreignKey: 'categoryId', as: 'galleryMedia' });
  db.Gallery.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

  // Users <-> Inquiries (Client who submitted)
  db.User.hasMany(db.Inquiry, { foreignKey: 'userId', as: 'inquiries' });
  db.Inquiry.belongsTo(db.User, { foreignKey: 'userId', as: 'client' });

  // Products <-> Inquiries
  db.Product.hasMany(db.Inquiry, { foreignKey: 'productId', as: 'inquiries' });
  db.Inquiry.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

  // Users <-> Inquiries (Assigned Manager/Admin)
  db.User.hasMany(db.Inquiry, { foreignKey: 'assignedTo', as: 'assignedInquiries' });
  db.Inquiry.belongsTo(db.User, { foreignKey: 'assignedTo', as: 'assignee' });

  // Favorites (M:N User <-> Product)
  db.User.belongsToMany(db.Product, { through: db.Favorite, foreignKey: 'userId', as: 'favoriteProducts' });
  db.Product.belongsToMany(db.User, { through: db.Favorite, foreignKey: 'productId', as: 'favoritedByUsers' });

  db.User.hasMany(db.Favorite, { foreignKey: 'userId', as: 'favorites' });
  db.Favorite.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

  db.Product.hasMany(db.Favorite, { foreignKey: 'productId', as: 'favorites' });
  db.Favorite.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

  // Users <-> Testimonials
  db.User.hasMany(db.Testimonial, { foreignKey: 'userId', as: 'testimonials' });
  db.Testimonial.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

  // Users <-> ActivityLogs
  db.User.hasMany(db.ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });
  db.ActivityLog.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

  db.sequelize = sequelize;
  return db;
};

module.exports = {
  db,
  setupModels
};
