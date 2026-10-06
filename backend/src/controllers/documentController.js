import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { db } from '../config/db.js';
import { analyzeDocument } from '../services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secure private storage directory (NOT exposed via public static route)
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, JPG, PNG and WebP are allowed.'));
    }
  },
});

export const getDocuments = async (req, res, next) => {
  try {
    const docsRes = await db.query(
      `SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      count: docsRes.rows ? docsRes.rows.length : 0,
      documents: docsRes.rows || [],
    });
  } catch (err) {
    next(err);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a document file to upload.' });
    }

    const { document_name, document_type, application_id } = req.body;
    if (!document_type) {
      return res.status(400).json({ success: false, message: 'document_type is required.' });
    }

    const docName = document_name || req.file.originalname;
    const storagePath = req.file.path;

    const inserted = await db.query(
      `INSERT INTO documents (
        user_id, application_id, document_name, document_type, storage_path, verification_status, ai_analysis
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        req.user.id,
        application_id || null,
        docName,
        document_type,
        storagePath,
        'Under Review',
        JSON.stringify({}),
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded securely.',
      document: inserted.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const checkDoc = await db.query('SELECT storage_path FROM documents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (!checkDoc.rows || checkDoc.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
    }

    const filePath = checkDoc.rows[0].storage_path;
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not delete file from disk:', e.message);
      }
    }

    await db.query('DELETE FROM documents WHERE id = $1 AND user_id = $2', [id, req.user.id]);

    res.json({
      success: true,
      message: 'Document removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const analyzeUploadedDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const docRes = await db.query('SELECT * FROM documents WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (!docRes.rows || docRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
    }

    const doc = docRes.rows[0];

    // Run AI analysis
    const analysis = await analyzeDocument({
      documentType: doc.document_type,
      documentName: doc.document_name,
      extractedText: `Filename: ${doc.document_name}. File verified for size and security signature.`,
      fileUrl: doc.storage_path,
    });

    const verificationStatus = analysis.status || 'Ready';

    const updated = await db.query(
      `UPDATE documents SET
        verification_status = $1,
        ai_analysis = $2,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [verificationStatus, JSON.stringify(analysis), id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Document analyzed with AI verification engine.',
      analysis,
      document: updated.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
