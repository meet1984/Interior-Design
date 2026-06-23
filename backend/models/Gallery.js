const { DataTypes, Model } = require('sequelize');

class Gallery extends Model {}

module.exports = (sequelize) => {
  Gallery.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    filePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_path'
    },
    mediaType: {
      type: DataTypes.ENUM('image', 'video'),
      defaultValue: 'image',
      field: 'media_type'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'category_id'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'Gallery',
    tableName: 'gallery',
    timestamps: true,
    paranoid: false
  });

  return Gallery;
};
