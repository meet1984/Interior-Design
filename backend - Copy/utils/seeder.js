const bcrypt = require('bcryptjs');

const seedDatabase = async (db) => {
  try {
    // 1. Check if roles already exist
    const rolesCount = await db.Role.count();
    if (rolesCount > 0) {
      console.log('Database already seeded. Skipping initial seeding.');
      return;
    }

    console.log('Seeding database with initial luxury interior design data...');

    // 2. Create Roles
    const adminRole = await db.Role.create({ name: 'admin' });
    const managerRole = await db.Role.create({ name: 'manager' });
    const clientRole = await db.Role.create({ name: 'client' });
    console.log('Roles seeded.');

    // 3. Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('AdminPass123!', salt);
    const managerPassword = await bcrypt.hash('ManagerPass123!', salt);
    const clientPassword = await bcrypt.hash('ClientPass123!', salt);

    const adminUser = await db.User.create({
      roleId: adminRole.id,
      firstName: 'Elizabeth',
      lastName: 'Vance',
      email: 'admin@klarehomes.com',
      password: adminPassword,
      phone: '+49 89 2019382',
      status: 'active',
      avatar: '/uploads/admin.webp'
    });

    const managerUser = await db.User.create({
      roleId: managerRole.id,
      firstName: 'Julian',
      lastName: 'Kohl',
      email: 'manager@klarehomes.com',
      password: managerPassword,
      phone: '+49 89 2019385',
      status: 'active',
      avatar: '/uploads/manager.webp'
    });

    const clientUser = await db.User.create({
      roleId: clientRole.id,
      firstName: 'Maximilian',
      lastName: 'Müller',
      email: 'client@klarehomes.com',
      password: clientPassword,
      phone: '+49 172 8983102',
      status: 'active',
      avatar: '/uploads/client.webp'
    });
    console.log('Users seeded (Admin, Manager, Client).');

    // 4. Create Settings
    await db.Setting.bulkCreate([
      { key: 'contact_email', value: 'concierge@klarehomes.com', group: 'contact' },
      { key: 'contact_phone', value: '+49 89 123 4567', group: 'contact' },
      { key: 'studio_address', value: 'Maximilianstraße 45, 80539 München, Germany', group: 'contact' },
      { key: 'opening_hours', value: 'Mon - Fri: 09:00 - 18:00, Sat: 10:00 - 15:00 (By Appointment)', group: 'general' },
      { key: 'currency', value: 'EUR', group: 'general' }
    ]);
    console.log('Settings seeded.');

    // 5. Create Categories (Kitchen, Wardrobes, Living)
    const kitchenCategory = await db.Category.create({
      name: 'Kitchens',
      slug: 'kitchens',
      description: 'Architectural kitchens tailored to precise dimensions. Elegant handleless cabinetry, premium finishes, and integrated custom smart organizers inspired by Nobilia and Poggenpohl.',
      image: '/uploads/kitchens.webp',
      status: 'active'
    });

    const wardrobeCategory = await db.Category.create({
      name: 'Wardrobes & Dressing Rooms',
      slug: 'wardrobes-dressing-rooms',
      description: 'Luxury sliding wardrobes, walk-in closets, and bespoke storage solutions with customized modular shelving, soft-close hardware, and ambient LED lighting.',
      image: '/uploads/wardrobes.webp',
      status: 'active'
    });

    const livingCategory = await db.Category.create({
      name: 'Living Spaces',
      slug: 'living-spaces',
      description: 'Sophisticated living area solutions featuring premium wood paneling, minimalist TV consoles, floating shelving, and modular designer storage units.',
      image: '/uploads/living-spaces.webp',
      status: 'active'
    });
    console.log('Categories seeded.');

    // 6. Create Collections
    const modernKitchenCollection = await db.Collection.create({
      categoryId: kitchenCategory.id,
      name: 'Modern Minimalist',
      slug: 'modern-minimalist',
      description: 'Clean lines, integrated handle profiles, and raw material textures like slate, concrete, and matte black steel.',
      image: '/uploads/modern-minimalist.webp',
      status: 'active'
    });

    const classicKitchenCollection = await db.Collection.create({
      categoryId: kitchenCategory.id,
      name: 'Architectural Oak',
      slug: 'architectural-oak',
      description: 'Warm oak timber grains combined with luxurious natural stone worktops for a timeless, organic aesthetic.',
      image: '/uploads/architectural-oak.webp',
      status: 'active'
    });

    const slidingWardrobesCollection = await db.Collection.create({
      categoryId: wardrobeCategory.id,
      name: 'Sliding Wardrobes',
      slug: 'sliding-wardrobes',
      description: 'Premium floor-to-ceiling sliding doors with tinted glass fronts, anodized aluminum frames, and quiet dampening tracks.',
      image: '/uploads/sliding-wardrobes.webp',
      status: 'active'
    });

    const walkInClosetsCollection = await db.Collection.create({
      categoryId: wardrobeCategory.id,
      name: 'Walk-In Closets',
      slug: 'walk-in-closets',
      description: 'The ultimate boutique-like dressing experience with open-faced cabinets, center islands, and velvet-lined accessory drawers.',
      image: '/uploads/walk-in-closets.webp',
      status: 'active'
    });

    const wallSystemsCollection = await db.Collection.create({
      categoryId: livingCategory.id,
      name: 'Luxury Living Wall Systems',
      slug: 'luxury-living-wall-systems',
      description: 'Sleek geometric floating units, rear-illuminated acoustic panels, and seamlessly integrated display cases.',
      image: '/uploads/wall-systems.webp',
      status: 'active'
    });
    console.log('Collections seeded.');

    // 7. Create Products
    const productsData = [
      {
        categoryId: kitchenCategory.id,
        collectionId: modernKitchenCollection.id,
        title: 'Nero Pure Matte Handleless Kitchen',
        slug: 'nero-pure-matte-handleless-kitchen',
        description: 'Inspired by Poggenpohl, the Nero Pure Matte features fingerprint-resistant nano-coatings on graphite black wood cores. Features custom milled handle channels, gold-tinted accents, and a massive solid quartzite monolith central island. Premium Blum Legrabox drawer slides and electric servo-drive openings are standard.',
        price: 48500.00,
        material: 'Fenix NTM, Natural Quartzite, Anodized Aluminum',
        dimensions: 'Island: 320cm x 120cm, Wall unit: 450cm x 240cm',
        colorVariants: ['#1E1E1E', '#2D2D2D', '#D4AF37'],
        thumbnail: '/uploads/nero-kitchen-thumb.webp',
        images: ['/uploads/nero-kitchen-1.webp', '/uploads/nero-kitchen-2.webp'],
        featuredFlag: true,
        status: 'active',
        createdBy: adminUser.id
      },
      {
        categoryId: kitchenCategory.id,
        collectionId: classicKitchenCollection.id,
        title: 'Chalfont Raw Oak & Marble Kitchen',
        slug: 'chalfont-raw-oak-marble-kitchen',
        description: 'A luxurious kitchen design matching rich, deep-brushed European Oak veneers with Italian Calacatta Gold marble worktops. Integrated appliances are concealed behind bookmatched grain doors. Double pantry cabinets feature internal lighting and solid oak drawers.',
        price: 65000.00,
        material: 'Brushed European Oak, Calacatta Marble',
        dimensions: 'Island: 280cm x 110cm, L-Shape: 360cm x 420cm',
        colorVariants: ['#C8A97E', '#FFFFFF', '#3E2723'],
        thumbnail: '/uploads/chalfont-kitchen-thumb.webp',
        images: ['/uploads/chalfont-kitchen-1.webp'],
        featuredFlag: true,
        status: 'active',
        createdBy: adminUser.id
      },
      {
        categoryId: wardrobeCategory.id,
        collectionId: slidingWardrobesCollection.id,
        title: 'AeroGlide Glass Sliding Wardrobe',
        slug: 'aeroglide-glass-sliding-wardrobe',
        description: 'Sleek, structural wardrobe system featuring custom-built soft-close sliding doors with tinted bronze safety glass. Fully customized internal cabinetry including pull-out shoe racks, trouser hangars, and dual-zone jewelry organizers with integrated sensor-activated LED bars.',
        price: 18200.00,
        material: 'Tempered Glass, Aluminum, Textured Melamine',
        dimensions: '300cm W x 260cm H x 68cm D',
        colorVariants: ['#8D6E63', '#3E2723', '#000000'],
        thumbnail: '/uploads/aeroglide-wardrobe-thumb.webp',
        images: ['/uploads/aeroglide-wardrobe-1.webp'],
        featuredFlag: false,
        status: 'active',
        createdBy: managerUser.id
      },
      {
        categoryId: wardrobeCategory.id,
        collectionId: walkInClosetsCollection.id,
        title: 'Boutique walk-in dressing lounge',
        slug: 'boutique-walk-in-dressing-lounge',
        description: 'Open-concept luxury walk-in wardrobe reminiscent of high-end fashion boutiques. Featuring a central display island with a glass top, velvet lining, soft leather upholstery accents, and back-lit shelving panels showcasing clothing collections.',
        price: 32400.00,
        material: 'Lacquered MDF, Tempered Glass, Suede Liners',
        dimensions: 'Custom Fit (Room size minimum: 4m x 3m)',
        colorVariants: ['#F5F5F5', '#E0E0E0', '#C8A97E'],
        thumbnail: '/uploads/boutique-closet-thumb.webp',
        images: ['/uploads/boutique-closet-1.webp'],
        featuredFlag: true,
        status: 'active',
        createdBy: adminUser.id
      },
      {
        categoryId: livingCategory.id,
        collectionId: wallSystemsCollection.id,
        title: 'Horizon Floating TV Wall System',
        slug: 'horizon-floating-tv-wall-system',
        description: 'Architectural living wall unit composed of a low-profile walnut floating media console, matched with black acoustic slatted backing panels and display shelving in satin brass. Supports screens up to 85 inches with hidden cable management ducts.',
        price: 12500.00,
        material: 'American Walnut, Acoustic Felt, Brushed Brass',
        dimensions: '380cm W x 220cm H x 45cm D',
        colorVariants: ['#4E342E', '#000000', '#BCAAA4'],
        thumbnail: '/uploads/horizon-wall-thumb.webp',
        images: ['/uploads/horizon-wall-1.webp'],
        featuredFlag: true,
        status: 'active',
        createdBy: managerUser.id
      }
    ];

    for (const p of productsData) {
      await db.Product.create(p);
    }
    console.log('Products seeded.');

    // 8. Create Projects
    const project1 = await db.Project.create({
      title: 'Munich Penthouse Kitchen',
      slug: 'munich-penthouse-kitchen',
      description: 'A bespoke installation featuring our Nero Pure Matte Kitchen in a stunning top-floor penthouse. Designed to highlight panoramic city views, the quartz central island was lifted by crane through the glass ceiling. The system integrates full smart home controls and custom LED circadian matching ambient light rows.',
      location: 'Bogenhausen, Munich',
      clientName: 'Dr. Andreas Fischer',
      projectType: 'Residential Penthouse',
      completionDate: '2025-11-20',
      status: 'completed',
      createdBy: adminUser.id
    });

    const project2 = await db.Project.create({
      title: 'Stuttgart Modern Dressing Suite',
      slug: 'stuttgart-modern-dressing-suite',
      description: 'Full renovation of a 40sqm bedroom suite into an open luxury dressing suite with custom walnut sliding wardrobe columns and central glass island display.',
      location: 'Killesberg, Stuttgart',
      clientName: 'Claudia Schiffer (Private Residence)',
      projectType: 'Residential Villa',
      completionDate: '2026-03-15',
      status: 'completed',
      createdBy: managerUser.id
    });
    console.log('Projects seeded.');

    // 9. Seed Project Media
    await db.ProjectMedia.bulkCreate([
      { projectId: project1.id, filePath: '/uploads/munich-penthouse-1.webp', mediaType: 'image', isPrimary: true },
      { projectId: project1.id, filePath: '/uploads/munich-penthouse-2.webp', mediaType: 'image', isPrimary: false },
      { projectId: project2.id, filePath: '/uploads/stuttgart-dressing-1.webp', mediaType: 'image', isPrimary: true }
    ]);
    console.log('Project Media seeded.');

    // 10. Seed Gallery
    await db.Gallery.bulkCreate([
      { title: 'Matte Handle Detail', description: 'Close up of gold recessed profile in black cabinetry', filePath: '/uploads/detail-1.webp', mediaType: 'image', categoryId: kitchenCategory.id },
      { title: 'Concealed Pantry Storage', description: 'Double pantry with pull-out wooden shelving units', filePath: '/uploads/detail-2.webp', mediaType: 'image', categoryId: kitchenCategory.id },
      { title: 'LED Shelf Backlighting', description: 'Soft lighting integrated inside dark wood drawers', filePath: '/uploads/detail-3.webp', mediaType: 'image', categoryId: wardrobeCategory.id }
    ]);
    console.log('Gallery seeded.');

    // 11. Seed Testimonials
    await db.Testimonial.bulkCreate([
      {
        userId: clientUser.id,
        clientName: 'Maximilian Müller',
        clientTitle: 'Owner, Berlin Urban Loft',
        avatar: '/uploads/client.webp',
        rating: 5,
        content: 'Klare Homes transformed our kitchen into an architectural statement. The attention to detail is remarkable, matching the exact standards of luxury German engineering. The handleless drawers open with a gentle touch, and the material finish feels premium day after day.',
        status: 'approved'
      },
      {
        clientName: 'Dr. Andreas Fischer',
        clientTitle: 'Resident, Munich Penthouse',
        avatar: '/uploads/avatar-fischer.webp',
        rating: 5,
        content: 'The execution of our penthouse kitchen project was flawless. From 3D design to logistics, they handled every challenge. Their products feel like art pieces that happen to be highly functional kitchens.',
        status: 'approved'
      }
    ]);
    console.log('Testimonials seeded.');

    // 12. Seed Activity Logs
    await db.ActivityLog.create({
      userId: adminUser.id,
      action: 'database_initialized',
      details: JSON.stringify({ message: 'System auto-seeded successfully with luxury default content.' }),
      ipAddress: '127.0.0.1'
    });
    console.log('Initial activity log created.');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
