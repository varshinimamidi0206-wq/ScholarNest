import { Router } from 'express';
import {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} from '../controllers/scholarshipController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getScholarships);
router.get('/:id', optionalAuth, getScholarshipById);
router.post('/', authenticate, createScholarship);
router.put('/:id', authenticate, updateScholarship);
router.delete('/:id', authenticate, deleteScholarship);

export default router;
