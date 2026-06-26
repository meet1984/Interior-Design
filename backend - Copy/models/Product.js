const { DataTypes, Model } = require('sequelize');

class Product extends Model {}

module.exports = (sequelize) => {
  Product.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id'
    },
    collectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'collection_id'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    material: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    dimensions: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    colorVariants: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'color_variants'
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true
    },
    featuredFlag: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'featured_flag'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'out_of_stock'),
      defaultValue: 'active'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by'
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    paranoid: false,
    deletedAt: 'deleted_at'
  });

  return Product;
};
