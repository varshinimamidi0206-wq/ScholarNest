import { Router } from 'express';
import {
  getEligibilityExplanation,
  handleNestGuide,
  getScholarshipSummary,
} from '../controllers/aiController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/eligibility-explanation', authenticate, getEligibilityExplanation);
router.post('/nestguide', optionalAuth, handleNestGuide);
router.post('/scholarship-summary', optionalAuth, getScholarshipSummary);

export default router;
