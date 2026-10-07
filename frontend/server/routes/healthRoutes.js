import { Router } from 'express';
import { db } from '../config/db.js';

const router = Router();

router.get('/', async (req, res) => {
  let dbStatus = 'healthy';
  try {
    await db.query('SELECT 1');
  } catch (err) {
    dbStatus = 'degraded';
  }

  res.json({
    success: true,
    status: 'ONLINE',
    service: 'ScholarNest Backend API',
    version: '1.0.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
