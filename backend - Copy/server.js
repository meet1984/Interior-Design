const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');
const { setupModels } = require('./models');
const seedDatabase = require('./utils/seeder');
const apiRoutes = require('./routes/api');

const app = express();
// 1. SECURITY MIDDLEWARES

// Helmet secures Express apps by setting various HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows cross-origin image loads from localhost
}));

// CORS setup to allow localhost and production frontend access
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like same-origin mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // If ALLOWED_ORIGINS is provided in .env, check against it
    if (process.env.ALLOWED_ORIGINS) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    }
    
    // Default fallback: reflect origin (allows all)
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-upload-type'],
  credentials: true
}));

// Rate limiting to prevent Brute-Force / DDOS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 5000 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Custom safe XSS body-sanitizer for Express 5 (prevents modifying read-only req.query)
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }
    }
  }
  next();
};
app.use(sanitizeBody);

// 2. PARSING MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. API ROUTING
app.use('/api', apiRoutes);

// 3.5 PRODUCTION FRONTEND SERVING
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  // Support both local monorepo structure (../frontend/dist) and CPanel combined structure (./dist)
  const localMonorepoPath = path.join(__dirname, '../frontend/dist');
  const cpanelPath = path.join(__dirname, 'dist');
  
  let frontendPath = null;
  if (fs.existsSync(cpanelPath)) {
    frontendPath = cpanelPath;
  } else if (fs.existsSync(localMonorepoPath)) {
    frontendPath = localMonorepoPath;
  }

  if (frontendPath) {
    console.log(`[SERVER] Serving frontend from: ${frontendPath}`);
    // Serve the static files from the React app build directory
    app.use(express.static(frontendPath));

    // Handle React routing, return all requests to React app
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      // Pass API and uploads requests to the error handler if they fell through
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    console.warn(`[WARNING] Production mode enabled but no frontend build directory found.`);
    app.get('/', (req, res) => res.send('API is running (Production). Frontend build missing.'));
  }
} else {
  // Root path simulator status for local development
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      system: 'Klare Homes Management API',
      version: '1.0.0',
      environment: 'development',
      documentation: '/api/docs (not configured)'
    });
  });
}

// 4. ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 5. BOOTSTRAP SYSTEM
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // A. Initialize database connection
    const sequelize = await initializeDatabase();
    
    // B. Setup Models and relations
    const db = setupModels(sequelize);
    
    // C. Sync database schema
    // IMPORTANT: alter:true is ONLY used in development.
    // In production (CPanel), we use { force: false } to never alter or drop existing tables.
    const isProduction = process.env.NODE_ENV === 'production';
    await sequelize.sync({ alter: !isProduction, force: false });
    console.log(`Database synced successfully. (mode: ${isProduction ? 'safe/production' : 'alter/development'})`);

    // D. Run initial seeding (Disabled to keep database empty)
    await seedDatabase(db);

    // E. Start Express listener
    app.listen(PORT, () => {
      console.log(`[SERVER RUNNING]: http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
