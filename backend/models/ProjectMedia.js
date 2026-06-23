const { DataTypes, Model } = require('sequelize');

class ProjectMedia extends Model {}

module.exports = (sequelize) => {
  ProjectMedia.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'project_id'
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
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_primary'
    }
  }, {
    sequelize,
    modelName: 'ProjectMedia',
    tableName: 'project_media',
    timestamps: true,
    paranoid: false // Media is hard-deleted or cascaded
  });

  return ProjectMedia;
};
