const { DataTypes, Model } = require('sequelize');

class Otp extends Model {}

module.exports = (sequelize) => {
  Otp.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: false
    },
    otp: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('registration', 'forgot_password', 'profile_update', 'login'),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at'
    }
  }, {
    sequelize,
    modelName: 'Otp',
    tableName: 'otps',
    timestamps: true,
    paranoid: false
  });

  return Otp;
};
