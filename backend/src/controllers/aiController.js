import { db } from '../config/db.js';
import { calculateMatchScore } from '../services/matchingService.js';
import { explainEligibility, askNestGuide } from '../services/aiService.js';

export const getEligibilityExplanation = async (req, res, next) => {
  try {
    const { scholarshipId, language = 'English' } = req.body;
    if (!scholarshipId) {
      return res.status(400).json({ success: false, message: 'scholarshipId is required.' });
    }

    const sRes = await db.query('SELECT * FROM scholarships WHERE id = $1', [scholarshipId]);
    if (!sRes.rows || sRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }
    const scholarship = sRes.rows[0];

    const studentRes = await db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    const student = (studentRes.rows && studentRes.rows[0]) || {};

    // 1. Calculate deterministic match
    const matchResult = calculateMatchScore(student, scholarship);

    // 2. Ask Gemini AI to explain the deterministic result
    const explanation = await explainEligibility({
      userId: req.user.id,
      student,
      scholarship,
      matchResult,
      language,
    });

    res.json({
      success: true,
      matchResult,
      explanation,
    });
  } catch (err) {
    next(err);
  }
};

export const handleNestGuide = async (req, res, next) => {
  try {
    const { message, scholarshipContext, history = [], language = 'English' } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    let student = {};
    if (req.user && req.user.id) {
      const studentRes = await db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
      student = (studentRes.rows && studentRes.rows[0]) || {};
    }

    const result = await askNestGuide({
      userId: req.user ? req.user.id : null,
      message,
      student,
      scholarshipContext,
      history,
      language,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getScholarshipSummary = async (req, res, next) => {
  try {
    const { scholarshipId, language = 'English' } = req.body;
    const sRes = await db.query('SELECT * FROM scholarships WHERE id = $1', [scholarshipId]);
    if (!sRes.rows || sRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }
    const scholarship = sRes.rows[0];

    const summary = {
      name: scholarship.name,
      provider: scholarship.provider,
      benefit: `INR ${Number(scholarship.amount).toLocaleString('en-IN')}`,
      deadline: scholarship.deadline,
      portal: scholarship.official_url,
      summaryText: scholarship.description,
      language,
    };

    res.json({
      success: true,
      summary,
    });
  } catch (err) {
    next(err);
  }
};
