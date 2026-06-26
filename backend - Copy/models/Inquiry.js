const { DataTypes, Model } = require('sequelize');

class Inquiry extends Model {}

module.exports = (sequelize) => {
  Inquiry.init({
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    inquiryType: {
      type: DataTypes.ENUM('general', 'quotation', 'product_inquiry'),
      defaultValue: 'general',
      field: 'inquiry_type'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'product_id'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_discussion', 'resolved', 'closed'),
      defaultValue: 'pending'
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'assigned_to'
    }
  }, {
    sequelize,
    modelName: 'Inquiry',
    tableName: 'inquiries',
    timestamps: true,
    paranoid: false
  });

  return Inquiry;
};
