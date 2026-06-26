const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'designer_db'
};

let sequelize;

const initializeDatabase = async () => {
  try {
    // 1. In local dev, try to create the database if it doesn't exist.
    // On CPanel, this usually fails due to permissions, so we catch the error gracefully.
    try {
      const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
      });
      
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await connection.end();
      console.log(`Database "${dbConfig.database}" verified/created successfully.`);
    } catch (err) {
      console.warn(`[WARNING] Could not run CREATE DATABASE. This is expected in CPanel production. Ensure the database "${dbConfig.database}" exists.`);
    }

    // 2. Initialize Sequelize instance
    sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: 'mysql',
      logging: false, // Set to console.log in development if needed
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true, // Use snake_case for field names internally
        paranoid: true // Enable soft deletes globally where applicable
      }
    });

    await sequelize.authenticate();
    console.log('MySQL Connection has been established successfully via Sequelize.');
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  getSequelize: () => sequelize
};
