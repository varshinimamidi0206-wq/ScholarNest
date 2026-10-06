import { db } from '../config/db.js';
import { calculateMatchScore } from '../services/matchingService.js';

export const getMatches = async (req, res, next) => {
  try {
    const studentRes = await db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    const student = (studentRes.rows && studentRes.rows[0]) || {};

    const scholarshipsRes = await db.query('SELECT * FROM scholarships WHERE status = $1', ['ACTIVE']);
    const scholarships = scholarshipsRes.rows || [];

    // Calculate dynamic scores for each scholarship
    const matches = scholarships.map(scholarship => {
      const matchResult = calculateMatchScore(student, scholarship);
      return {
        scholarship,
        ...matchResult,
      };
    });

    // Sort strictly by matchScore descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (err) {
    next(err);
  }
};

export const postMatches = async (req, res, next) => {
  try {
    const { studentProfile, scholarshipId } = req.body;

    let student = studentProfile;
    if (!student && req.user && req.user.id) {
      const studentRes = await db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
      student = (studentRes.rows && studentRes.rows[0]) || {};
    }

    if (!scholarshipId) {
      return res.status(400).json({ success: false, message: 'Scholarship ID is required.' });
    }

    const sRes = await db.query('SELECT * FROM scholarships WHERE id = $1', [scholarshipId]);
    if (!sRes.rows || sRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    const scholarship = sRes.rows[0];
    const matchResult = calculateMatchScore(student || {}, scholarship);

    res.json({
      success: true,
      scholarship,
      ...matchResult,
    });
  } catch (err) {
    next(err);
  }
};
