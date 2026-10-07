import { db } from '../config/db.js';
import { calculateMatchScore } from '../services/matchingService.js';

export const getSavedScholarships = async (req, res, next) => {
  try {
    const studentRes = await db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    const student = (studentRes.rows && studentRes.rows[0]) || {};

    const savedRes = await db.query(
      `SELECT s.*, ss.created_at as saved_at 
       FROM saved_scholarships ss 
       JOIN scholarships s ON ss.scholarship_id = s.id 
       WHERE ss.user_id = $1 
       ORDER BY ss.created_at DESC`,
      [req.user.id]
    );

    const list = (savedRes.rows || []).map(s => {
      const match = calculateMatchScore(student, s);
      return {
        ...s,
        id: s.scholarship_id || s.id,
        matchScore: match.matchScore,
        eligible: match.eligible,
        isSaved: true,
      };
    });

    res.json({
      success: true,
      count: list.length,
      saved: list,
    });
  } catch (err) {
    next(err);
  }
};

export const saveScholarship = async (req, res, next) => {
  try {
    const { scholarshipId } = req.params;

    // Check if scholarship exists
    const checkScholarship = await db.query('SELECT id FROM scholarships WHERE id = $1', [scholarshipId]);
    if (!checkScholarship.rows || checkScholarship.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    // Check if already saved
    const existing = await db.query(
      'SELECT id FROM saved_scholarships WHERE user_id = $1 AND scholarship_id = $2',
      [req.user.id, scholarshipId]
    );

    if (existing.rows && existing.rows.length > 0) {
      return res.json({ success: true, message: 'Scholarship is already saved in your nest.' });
    }

    await db.query(
      'INSERT INTO saved_scholarships (user_id, scholarship_id) VALUES ($1, $2)',
      [req.user.id, scholarshipId]
    );

    res.status(201).json({
      success: true,
      message: 'Scholarship saved successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const unsaveScholarship = async (req, res, next) => {
  try {
    const { scholarshipId } = req.params;
    await db.query(
      'DELETE FROM saved_scholarships WHERE user_id = $1 AND scholarship_id = $2',
      [req.user.id, scholarshipId]
    );

    res.json({
      success: true,
      message: 'Scholarship removed from saved list.',
    });
  } catch (err) {
    next(err);
  }
};
