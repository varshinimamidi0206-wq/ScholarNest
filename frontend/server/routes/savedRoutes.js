import { Router } from 'express';
import {
  getSavedScholarships,
  saveScholarship,
  unsaveScholarship,
} from '../controllers/savedController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getSavedScholarships);
router.post('/:scholarshipId', saveScholarship);
router.delete('/:scholarshipId', unsaveScholarship);

export default router;
