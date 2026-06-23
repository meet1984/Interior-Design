const { db } = require('../models');
const { logActivity } = require('../utils/logger');

const getFavorites = async (req, res) => {
  try {
    const favorites = await db.Favorite.findAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: db.Product, 
          as: 'product',
          include: [
            { model: db.Category, as: 'category', attributes: ['id', 'name', 'slug'] },
            { model: db.Collection, as: 'collection', attributes: ['id', 'name', 'slug'] }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({ success: true, count: favorites.length, data: favorites });
  } catch (error) {
    console.error('Fetch favorites error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching favorites' });
  }
};

const toggleFavorite = async (req, res) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await db.Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = await db.Favorite.findOne({
      where: { userId: req.user.id, productId }
    });

    if (existing) {
      // Remove favorite
      await existing.destroy();
      await logActivity(req.user.id, 'favorite_removed', `Removed product ID ${productId} from favorites`, req);
      return res.status(200).json({ success: true, favorited: false, message: 'Product removed from favorites' });
    } else {
      // Add favorite
      await db.Favorite.create({
        userId: req.user.id,
        productId
      });
      await logActivity(req.user.id, 'favorite_added', `Added product ID ${productId} to favorites`, req);
      return res.status(201).json({ success: true, favorited: true, message: 'Product saved to favorites' });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({ success: false, message: 'Server error toggling favorite' });
  }
};

module.exports = {
  getFavorites,
  toggleFavorite
};
