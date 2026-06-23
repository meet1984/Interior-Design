const { DataTypes, Model } = require('sequelize');

class Project extends Model {}

module.exports = (sequelize) => {
  Project.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
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
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    clientName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'client_name'
    },
    projectType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'project_type'
    },
    completionDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'completion_date'
    },
    status: {
      type: DataTypes.ENUM('planning', 'in_progress', 'completed'),
      defaultValue: 'completed'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by'
    }
  }, {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    timestamps: true,
    paranoid: false,
    deletedAt: 'deleted_at'
  });

  return Project;
};
