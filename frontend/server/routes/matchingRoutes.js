import { Router } from 'express';
import { getMatches, postMatches } from '../controllers/matchingController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getMatches);
router.post('/', optionalAuth, postMatches);

export default router;
