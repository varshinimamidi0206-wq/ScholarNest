import { Router } from 'express';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  analyzeUploadedDocument,
  uploadMiddleware,
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/', uploadMiddleware.single('file'), uploadDocument);
router.delete('/:id', deleteDocument);
router.post('/:id/analyze', analyzeUploadedDocument);

export default router;
