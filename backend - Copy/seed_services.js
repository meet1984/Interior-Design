const { initializeDatabase } = require('./config/db');
const { setupModels } = require('./models');

const seedServices = async () => {
  try {
    const sequelize = await initializeDatabase();
    const db = setupModels(sequelize);
    await sequelize.sync({ alter: true });

    const count = await db.Service.count();
    if (count === 0) {
      await db.Service.bulkCreate([
        {
          title: "Showroom Consulting",
          description: "Meet in Munich or Stuttgart with a senior interior architect. We analyze architectural drawings, floor plans, and material preferences.",
          order: 0,
          isActive: true
        },
        {
          title: "Bespoke 3D Architectural Renderings",
          description: "High-fidelity photorealistic visualizations of your spaces, incorporating exact materials, shadows, and interior lighting arrangements.",
          order: 1,
          isActive: true
        },
        {
          title: "Millwork Engineering",
          description: "Every cabinet, drawer, panel, and spacer is modeled in CAD to sub-millimeter tolerances. Engineered for flawless fits.",
          order: 2,
          isActive: true
        },
        {
          title: "Material Curation",
          description: "Sourcing premium marbles, Fenix NTM surfaces, European oak timbers, and anodized hardware directly from premium European mills.",
          order: 3,
          isActive: true
        },
        {
          title: "White-Glove Installation",
          description: "Managed execution by our private crew of certified cabinetmakers. We align every reveal and coordinate built-in appliance wiring.",
          order: 4,
          isActive: true
        },
        {
          title: "Post-Installation Care",
          description: "Lifetime alignment verification on hinges and runner mechanisms. 10-year warranty on structural panels.",
          order: 5,
          isActive: true
        }
      ]);
      console.log('Successfully seeded the 6 default services into the database!');
    } else {
      console.log('Services already exist in the database.');
    }
  } catch (err) {
    console.error('Error seeding services:', err);
  } finally {
    process.exit();
  }
};

seedServices();
