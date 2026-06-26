const { DataTypes, Model } = require('sequelize');

class Setting extends Model {}

module.exports = (sequelize) => {
  Setting.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    group: {
      type: DataTypes.STRING(50),
      defaultValue: 'general'
    }
  }, {
    sequelize,
    modelName: 'Setting',
    tableName: 'settings',
    timestamps: true,
    paranoid: false
  });

  return Setting;
};
