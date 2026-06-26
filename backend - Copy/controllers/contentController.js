const { db } = require('../models');

// Fetch Public Content
const getPublicContent = async (req, res) => {
  try {
    const services = await db.Service.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['id', 'ASC']]
    });

    const settingsRecords = await db.Setting.findAll({
      where: {
        key: ['about_title', 'about_description']
      }
    });

    const about = {
      title: "A Design House Rooted in German Precision",
      description: "Established as a high-end design house in Munich, Germany, Klare Homes represents the pinnacle of custom interior millwork..."
    };

    settingsRecords.forEach(record => {
      if (record.key === 'about_title') about.title = record.value;
      if (record.key === 'about_description') about.description = record.value;
    });

    return res.status(200).json({
      success: true,
      data: {
        services,
        about
      }
    });
  } catch (error) {
    console.error('Fetch public content error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching content' });
  }
};

// Get All Services (Admin)
const getAdminServices = async (req, res) => {
  try {
    const services = await db.Service.findAll({
      order: [['order', 'ASC'], ['id', 'ASC']]
    });
    return res.status(200).json({ success: true, data: services });
  } catch (error) {
    console.error('Fetch admin services error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching services' });
  }
};

// Create Service
const createService = async (req, res) => {
  const { title, description, isActive } = req.body;

  try {
    const maxOrderService = await db.Service.findOne({
      order: [['order', 'DESC']]
    });
    const nextOrder = maxOrderService ? maxOrderService.order + 1 : 0;

    let iconPath = null;
    if (req.file) {
      iconPath = `/uploads/${req.file.filename}`;
    }

    const service = await db.Service.create({
      title,
      description,
      icon: iconPath,
      isActive: isActive === 'true' || isActive === true,
      order: nextOrder
    });

    return res.status(201).json({ success: true, data: service, message: 'Service created successfully' });
  } catch (error) {
    console.error('Create service error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating service' });
  }
};

// Update Service
const updateService = async (req, res) => {
  const { id } = req.params;
  const { title, description, isActive } = req.body;

  try {
    const service = await db.Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (title) service.title = title;
    if (description) service.description = description;
    if (isActive !== undefined) service.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      service.icon = `/uploads/${req.file.filename}`;
    }

    await service.save();

    return res.status(200).json({ success: true, data: service, message: 'Service updated successfully' });
  } catch (error) {
    console.error('Update service error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating service' });
  }
};

// Delete Service
const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await db.Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await service.destroy();
    return res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting service' });
  }
};

// Reorder Services
const reorderServices = async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ success: false, message: 'orderedIds must be an array' });
  }

  try {
    // Need to do this sequentially or within a transaction
    for (let i = 0; i < orderedIds.length; i++) {
      await db.Service.update(
        { order: i },
        { where: { id: orderedIds[i] } }
      );
    }

    return res.status(200).json({ success: true, message: 'Services reordered successfully' });
  } catch (error) {
    console.error('Reorder services error:', error);
    return res.status(500).json({ success: false, message: 'Server error reordering services' });
  }
};

// Save About Content
const updateAboutContent = async (req, res) => {
  const { title, description } = req.body;

  try {
    if (title !== undefined) {
      const [record] = await db.Setting.findOrCreate({ where: { key: 'about_title' }, defaults: { value: title } });
      if (record) await record.update({ value: title });
    }
    
    if (description !== undefined) {
      const [record] = await db.Setting.findOrCreate({ where: { key: 'about_description' }, defaults: { value: description } });
      if (record) await record.update({ value: description });
    }

    return res.status(200).json({ success: true, message: 'About content updated successfully' });
  } catch (error) {
    console.error('Update about content error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating about content' });
  }
};

module.exports = {
  getPublicContent,
  getAdminServices,
  createService,
  updateService,
  deleteService,
  reorderServices,
  updateAboutContent
};
