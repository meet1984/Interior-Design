const { db } = require('../models');
const { logActivity } = require('../utils/logger');
const { Op } = require('sequelize');

// Slugify helper
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const getProjects = async (req, res) => {
  try {
    const filter = req.user && ['admin', 'manager'].includes(req.user.role.name) ? {} : { status: 'completed' };
    const projects = await db.Project.findAll({
      where: filter,
      include: [{ model: db.ProjectMedia, as: 'media' }],
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching projects' });
  }
};

const getProjectBySlug = async (req, res) => {
  try {
    const project = await db.Project.findOne({
      where: { slug: req.params.slug },
      include: [{ model: db.ProjectMedia, as: 'media' }]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('Fetch project error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching project' });
  }
};

const createProject = async (req, res) => {
  const { title, description, location, clientName, projectType, completionDate, status } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    const slug = slugify(title);
    const existing = await db.Project.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Project title already exists' });
    }

    const project = await db.Project.create({
      title,
      slug,
      description,
      location,
      clientName,
      projectType,
      completionDate: completionDate || null,
      status: status || 'completed',
      createdBy: req.user.id
    });

    // Handle uploaded project media files
    if (req.files && req.files.length > 0) {
      const mediaData = req.files.map((file, index) => {
        const ext = file.filename.split('.').pop().toLowerCase();
        const mediaType = ['mp4', 'webm', 'mov'].includes(ext) ? 'video' : 'image';
        return {
          projectId: project.id,
          filePath: `/uploads/${file.filename}`,
          mediaType,
          isPrimary: index === 0 // Mark the first uploaded file as primary
        };
      });
      await db.ProjectMedia.bulkCreate(mediaData);
    }

    await logActivity(req.user.id, 'project_created', `Created project portfolio item: ${title}`, req);

    const fullProject = await db.Project.findByPk(project.id, {
      include: [{ model: db.ProjectMedia, as: 'media' }]
    });

    return res.status(201).json({ success: true, message: 'Project created successfully', data: fullProject });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating project' });
  }
};

const updateProject = async (req, res) => {
  const { title, description, location, clientName, projectType, completionDate, status } = req.body;

  try {
    const project = await db.Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (title) {
      project.title = title;
      project.slug = slugify(title);
    }
    if (description !== undefined) project.description = description;
    if (location !== undefined) project.location = location;
    if (clientName !== undefined) project.clientName = clientName;
    if (projectType !== undefined) project.projectType = projectType;
    if (completionDate !== undefined) project.completionDate = completionDate || null;
    if (status) project.status = status;

    await project.save();

    // Handle additional uploaded project media files
    if (req.files && req.files.length > 0) {
      const mediaData = req.files.map((file) => {
        const ext = file.filename.split('.').pop().toLowerCase();
        const mediaType = ['mp4', 'webm', 'mov'].includes(ext) ? 'video' : 'image';
        return {
          projectId: project.id,
          filePath: `/uploads/${file.filename}`,
          mediaType,
          isPrimary: false
        };
      });
      await db.ProjectMedia.bulkCreate(mediaData);
    }

    await logActivity(req.user.id, 'project_updated', `Updated project portfolio item: ${project.title}`, req);

    const fullProject = await db.Project.findByPk(project.id, {
      include: [{ model: db.ProjectMedia, as: 'media' }]
    });

    return res.status(200).json({ success: true, message: 'Project updated successfully', data: fullProject });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await db.Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const title = project.title;
    await project.destroy();

    await logActivity(req.user.id, 'project_deleted', `Deleted project portfolio item: ${title}`, req);

    return res.status(200).json({ success: true, message: `Project "${title}" soft deleted successfully.` });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting project' });
  }
};

const deleteProjectMedia = async (req, res) => {
  try {
    const media = await db.ProjectMedia.findByPk(req.params.mediaId);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Project media file not found' });
    }

    const projectId = media.projectId;
    await media.destroy();

    return res.status(200).json({ success: true, message: 'Media file removed from project' });
  } catch (error) {
    console.error('Delete media error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting media' });
  }
};

module.exports = {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  deleteProjectMedia
};
