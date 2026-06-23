const { DataTypes, Model } = require('sequelize');

class Favorite extends Model {}

module.exports = (sequelize) => {
  Favorite.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id'
    }
  }, {
    sequelize,
    modelName: 'Favorite',
    tableName: 'favorites',
    timestamps: true, // Stores created_at
    updatedAt: false, // Favorites only have created_at
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'product_id']
      }
    ]
  });

  return Favorite;
};
