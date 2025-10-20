/**
 * Company Code Management Microservice
 * Express.js server with Swagger documentation and H2 database
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const swaggerSpecs = require('./config/swagger');
const companyCodeRoutes = require('./routes/companyCodeRoutes');
const { getDatabase } = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database on startup
const db = getDatabase();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'], // Allow Electron app
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Company Code Management Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// API Routes
app.use('/api', companyCodeRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Company Code API Documentation',
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true
  }
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Company Code Management Microservice',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      'GET /api/company-codes': 'Get all company codes',
      'POST /api/company-codes': 'Create new company code',
      'GET /api/company-codes/:id': 'Get company code by ID',
      'PUT /api/company-codes/:id': 'Update company code',
      'DELETE /api/company-codes/:id': 'Delete company code',
      'GET /api/company-codes/search/:companyCode': 'Search by company code',
      'GET /api/company-codes/stats': 'Get statistics',
      'GET /api/company-codes/options': 'Get dropdown options'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api-docs',
      'GET /api/company-codes',
      'POST /api/company-codes',
      'GET /api/company-codes/:id',
      'PUT /api/company-codes/:id',
      'DELETE /api/company-codes/:id'
    ]
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  db.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                Company Code Management Service                   ║
╠══════════════════════════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:${PORT}                     ║
║  📚 API Documentation: http://localhost:${PORT}/api-docs            ║
║  🏥 Health Check: http://localhost:${PORT}/health                   ║
║  💾 Database: In-Memory SQLite (H2 equivalent)                  ║
║  🛡️  CORS enabled for Electron app                              ║
╚══════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;