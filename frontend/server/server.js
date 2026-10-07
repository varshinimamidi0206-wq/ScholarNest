import path from 'path';
import { fileURLToPath } from 'url';
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

// Ensure database is initialized before any requests are served
let dbReady = false;
let dbInitPromise = null;

export async function ensureDbReady() {
  if (!dbReady) {
    if (!dbInitPromise) {
      dbInitPromise = db.init().then(() => {
        dbReady = true;
      }).catch((err) => {
        console.warn('[DB] Init error:', err.message);
        dbReady = true;
      });
    }
    await dbInitPromise;
  }
}

app.use(async (req, res, next) => {
  try {
    await ensureDbReady();
    next();
  } catch (err) {
    next(err);
  }
});

// API Router — supports both /api/* and direct /* calls seamlessly
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/scholarships', scholarshipRoutes);
apiRouter.use('/matches', matchingRoutes);
apiRouter.use('/saved', savedRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/health', healthRoutes);

// Root greeting
apiRouter.get('/', (req, res) => {
  res.json({
    service: 'ScholarNest API',
    tagline: 'Your Path to the Right Scholarship',
    documentation: '/api/health',
  });
});

// Mount router under both /api and root to handle any proxy/rewrite path configuration
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on ScholarNest server.`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start server listener for local / container runtime
async function startServer() {
  try {
    await ensureDbReady();
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

const __filename = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

// Only launch HTTP listener when executed directly as entrypoint, not when imported as serverless handler
if (isDirectRun && !process.env.VERCEL) {
  startServer();
}

export default app;
