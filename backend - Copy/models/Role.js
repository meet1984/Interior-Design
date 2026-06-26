const { DataTypes, Model } = require('sequelize');

class Role extends Model {}

module.exports = (sequelize) => {
  Role.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
    paranoid: false // Roles are static and do not support soft deletes
  });

  return Role;
};
