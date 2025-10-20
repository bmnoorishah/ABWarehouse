const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

// Import company code service components
const swaggerSpecs = require('./company-code-service/config/swagger');
const companyCodeRoutes = require('./company-code-service/routes/companyCodeRoutes');
const { getDatabase } = require('./company-code-service/database/database');

// Keep a global reference of the window object
let mainWindow;
let expressServer;

// Initialize Express server with company code service
function initializeExpressServer() {
  const expressApp = express();
  const PORT = 3001;

  // Initialize database on startup
  const db = getDatabase();

  // Middleware
  expressApp.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  expressApp.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],
    credentials: true
  }));

  expressApp.use(morgan('combined'));
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  expressApp.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      service: 'Company Code Management Service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  });

  // Swagger documentation
  expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Company Code Management API',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true
    }
  }));

  // API routes
  expressApp.use('/api/company-codes', companyCodeRoutes);

  // Root endpoint
  expressApp.get('/', (req, res) => {
    res.json({
      message: 'Company Code Management API is running',
      version: '1.0.0',
      documentation: '/api-docs',
      endpoints: {
        health: '/health',
        companyCode: '/api/company-codes'
      }
    });
  });

  // Error handling middleware
  expressApp.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  });

  // Start server
  expressServer = expressApp.listen(PORT, 'localhost', () => {
    console.log(`Company Code Service running on http://localhost:${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  });

  expressServer.on('error', (err) => {
    console.error('Express server error:', err);
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'ABWarehouse',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png') // Optional icon
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Start the Express server first
  initializeExpressServer();
  
  // Wait a moment for server to start, then create window
  setTimeout(() => {
    createWindow();
  }, 1000);
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // Close Express server when app is closing
  if (expressServer) {
    expressServer.close(() => {
      console.log('Express server closed');
    });
  }
  
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app termination
app.on('before-quit', () => {
  if (expressServer) {
    expressServer.close();
  }
});