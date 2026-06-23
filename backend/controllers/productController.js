const { db } = require('../models');
const { logActivity } = require('../utils/logger');
const { Op } = require('sequelize');

// Slugify helper
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');         // Replace multiple - with single -
};

// ==========================================
// CATEGORIES CONTROLLER
// ==========================================

const getCategories = async (req, res) => {
  try {
    const categories = await db.Category.findAll({
      where: req.user && ['admin', 'manager'].includes(req.user.role.name) ? {} : { status: 'active' },
      include: [{ model: db.Collection, as: 'collections' }]
    });
    return res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const category = await db.Category.findOne({
      where: { slug: req.params.slug },
      include: [{ 
        model: db.Collection, 
        as: 'collections',
        where: req.user && ['admin', 'manager'].includes(req.user.role.name) ? {} : { status: 'active' },
        required: false
      }]
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error('Fetch category error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching category' });
  }
};

const createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const slug = slugify(name);
    const existing = await db.Category.findOne({ where: { [Op.or]: [{ name }, { slug }] } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category name or slug already exists' });
    }

    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const category = await db.Category.create({
      name,
      slug,
      description,
      image,
      status: 'active'
    });

    await logActivity(req.user.id, 'category_created', `Created category: ${name}`, req);

    return res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating category' });
  }
};

const updateCategory = async (req, res) => {
  const { name, description, status } = req.body;
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }
    if (description !== undefined) category.description = description;
    if (status) category.status = status;

    if (req.file) {
      category.image = `/uploads/${req.file.filename}`;
    }

    await category.save();

    await logActivity(req.user.id, 'category_updated', `Updated category: ${category.name}`, req);

    return res.status(200).json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const name = category.name;
    // Perform soft delete
    await category.destroy();

    // Cascade soft delete to collections
    await db.Collection.destroy({
      where: { categoryId: category.id }
    });

    // Cascade soft delete to products
    await db.Product.destroy({
      where: { categoryId: category.id }
    });

    await logActivity(req.user.id, 'category_deleted', `Deleted category: ${name}`, req);

    return res.status(200).json({ success: true, message: `Category "${name}" soft deleted successfully.` });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting category' });
  }
};

// ==========================================
// COLLECTIONS CONTROLLER
// ==========================================

const getCollections = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = req.user && ['admin', 'manager'].includes(req.user.role.name) ? {} : { status: 'active' };
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const collections = await db.Collection.findAll({
      where: filter,
      include: [
        { model: db.Category, as: 'category', attributes: ['id', 'name', 'slug'] }
      ]
    });

    return res.status(200).json({ success: true, count: collections.length, data: collections });
  } catch (error) {
    console.error('Fetch collections error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching collections' });
  }
};

const getCollectionBySlug = async (req, res) => {
  try {
    const collection = await db.Collection.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: db.Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { 
          model: db.Product, 
          as: 'products',
          where: req.user && ['admin', 'manager'].includes(req.user.role.name) ? {} : { status: 'active' },
          required: false
        }
      ]
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    return res.status(200).json({ success: true, data: collection });
  } catch (error) {
    console.error('Fetch collection error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching collection' });
  }
};

const createCollection = async (req, res) => {
  const { categoryId, name, description } = req.body;
  try {
    if (!categoryId || !name) {
      return res.status(400).json({ success: false, message: 'Category ID and Name are required' });
    }

    // Verify category exists
    const category = await db.Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Target category does not exist' });
    }

    const slug = slugify(name);
    const existing = await db.Collection.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Collection slug already exists, please try another name.' });
    }

    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const collection = await db.Collection.create({
      categoryId,
      name,
      slug,
      description,
      image,
      status: 'active'
    });

    await logActivity(req.user.id, 'collection_created', `Created collection: ${name} under ${category.name}`, req);

    return res.status(201).json({ success: true, message: 'Collection created', data: collection });
  } catch (error) {
    console.error('Create collection error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating collection' });
  }
};

const updateCollection = async (req, res) => {
  const { name, description, status, categoryId } = req.body;
  try {
    const collection = await db.Collection.findByPk(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (categoryId) {
      const category = await db.Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ success: false, message: 'Category not found' });
      }
      collection.categoryId = categoryId;
    }

    if (name) {
      collection.name = name;
      collection.slug = slugify(name);
    }
    if (description !== undefined) collection.description = description;
    if (status) collection.status = status;

    if (req.file) {
      collection.image = `/uploads/${req.file.filename}`;
    }

    await collection.save();

    await logActivity(req.user.id, 'collection_updated', `Updated collection: ${collection.name}`, req);

    return res.status(200).json({ success: true, message: 'Collection updated', data: collection });
  } catch (error) {
    console.error('Update collection error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating collection' });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const collection = await db.Collection.findByPk(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const name = collection.name;
    // Perform soft delete
    await collection.destroy();

    // Cascade soft delete to products
    await db.Product.destroy({
      where: { collectionId: collection.id }
    });

    await logActivity(req.user.id, 'collection_deleted', `Deleted collection: ${name}`, req);

    return res.status(200).json({ success: true, message: `Collection "${name}" soft deleted successfully.` });
  } catch (error) {
    console.error('Delete collection error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting collection' });
  }
};

// ==========================================
// PRODUCTS CONTROLLER
// ==========================================

const getProducts = async (req, res) => {
  const { categoryId, collectionId, featured, limit, search } = req.query;
  try {
    const filter = req.user && ['admin', 'manager'].includes(req.user.role.name) 
      ? {} 
      : { status: { [Op.in]: ['active', 'out_of_stock'] } };

    if (categoryId) filter.categoryId = categoryId;
    if (collectionId) filter.collectionId = collectionId;
    if (featured !== undefined) filter.featuredFlag = featured === 'true';

    if (search) {
      filter[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { material: { [Op.like]: `%${search}%` } }
      ];
    }

    const products = await db.Product.findAll({
      where: filter,
      limit: limit ? parseInt(limit) : undefined,
      include: [
        { model: db.Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: db.Collection, as: 'collection', attributes: ['id', 'name', 'slug'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const product = await db.Product.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: db.Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: db.Collection, as: 'collection', attributes: ['id', 'name', 'slug'] },
        { model: db.User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Fetch product error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching product' });
  }
};

const createProduct = async (req, res) => {
  const { categoryId, collectionId, title, description, price, material, dimensions, colorVariants, featuredFlag } = req.body;

  try {
    // 1. Validate inputs
    if (!categoryId || !collectionId || !title || !price) {
      return res.status(400).json({ success: false, message: 'Category, Collection, Title, and Price are required.' });
    }

    // 2. Validate hierarchy Category -> Collection
    const collection = await db.Collection.findOne({
      where: { id: collectionId, categoryId }
    });

    if (!collection) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid hierarchy: Selected Collection does not belong to the selected Category.' 
      });
    }

    const slug = slugify(title);
    const existing = await db.Product.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product title already exists' });
    }

    // Handle files (Multer)
    let thumbnail = null;
    let images = [];

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.images) {
        images = req.files.images.map(file => `/uploads/${file.filename}`);
      }
    }

    let colors = null;
    if (colorVariants) {
      try {
        colors = typeof colorVariants === 'string' ? JSON.parse(colorVariants) : colorVariants;
      } catch (e) {
        colors = colorVariants.toString().split(',');
      }
    }

    const product = await db.Product.create({
      categoryId,
      collectionId,
      title,
      slug,
      description,
      price: parseFloat(price),
      material,
      dimensions,
      colorVariants: colors,
      thumbnail,
      images,
      featuredFlag: featuredFlag === 'true' || featuredFlag === true,
      status: 'active',
      createdBy: req.user.id
    });

    await logActivity(req.user.id, 'product_created', `Created product: ${title}`, req);

    return res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating product' });
  }
};

const updateProduct = async (req, res) => {
  const { categoryId, collectionId, title, description, price, material, dimensions, colorVariants, featuredFlag, status } = req.body;

  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate category & collection hierarchy if either is changing
    const finalCategoryId = categoryId || product.categoryId;
    const finalCollectionId = collectionId || product.collectionId;

    if (categoryId || collectionId) {
      const collection = await db.Collection.findOne({
        where: { id: finalCollectionId, categoryId: finalCategoryId }
      });
      if (!collection) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid hierarchy: Selected Collection does not belong to the selected Category.' 
        });
      }
      product.categoryId = finalCategoryId;
      product.collectionId = finalCollectionId;
    }

    if (title) {
      product.title = title;
      product.slug = slugify(title);
    }
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (material !== undefined) product.material = material;
    if (dimensions !== undefined) product.dimensions = dimensions;
    if (status) product.status = status;
    if (featuredFlag !== undefined) product.featuredFlag = featuredFlag === 'true' || featuredFlag === true;

    if (colorVariants !== undefined) {
      try {
        product.colorVariants = typeof colorVariants === 'string' ? JSON.parse(colorVariants) : colorVariants;
      } catch (e) {
        product.colorVariants = colorVariants.toString().split(',');
      }
    }

    // Handle files if uploaded
    let currentImages = product.images || [];
    if (req.body.existingImages) {
      try {
        currentImages = typeof req.body.existingImages === 'string' 
          ? JSON.parse(req.body.existingImages) 
          : req.body.existingImages;
      } catch (e) {
        console.error('Error parsing existingImages:', e);
      }
    }

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        product.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.images) {
        const newImages = req.files.images.map(file => `/uploads/${file.filename}`);
        currentImages = [...currentImages, ...newImages];
      }
    }
    product.images = currentImages;

    await product.save();

    await logActivity(req.user.id, 'product_updated', `Updated product: ${product.title}`, req);

    return res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const title = product.title;
    await product.destroy();

    await logActivity(req.user.id, 'product_deleted', `Deleted product: ${title}`, req);

    return res.status(200).json({ success: true, message: `Product "${title}" soft deleted successfully.` });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,

  getCollections,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection,

  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
};
