import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { db } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import scholarshipRoutes from './routes/scholarshipRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import savedRoutes from './routes/savedRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow frontend dev & preview origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging in dev
if (config.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/matches', matchingRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/health', healthRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    service: 'ScholarNest API',
    tagline: 'Your Path to the Right Scholarship',
    documentation: '/api/health',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on ScholarNest server.`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start server after DB initialization
async function startServer() {
  try {
    await db.init();
    const server = app.listen(config.PORT, () => {
      console.log(`===================================================`);
      console.log(`  ScholarNest API Server Running on port ${config.PORT}`);
      console.log(`  Environment: ${config.NODE_ENV}`);
      console.log(`  Health Check: http://localhost:${config.PORT}/api/health`);
      console.log(`===================================================`);
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
