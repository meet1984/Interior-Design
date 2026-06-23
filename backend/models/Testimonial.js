const { DataTypes, Model } = require('sequelize');

class Testimonial extends Model {}

module.exports = (sequelize) => {
  Testimonial.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id'
    },
    clientName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'client_name'
    },
    clientTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'client_title'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 1,
        max: 5
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Testimonial',
    tableName: 'testimonials',
    timestamps: true,
    paranoid: false
  });

  return Testimonial;
};
