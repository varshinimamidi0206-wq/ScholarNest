import { db } from '../config/db.js';
import { calculateMatchScore } from '../services/matchingService.js';

// In-memory cache for active scholarships to prevent repeated DB full-table scans
let cachedActiveScholarships = null;
let lastScholarshipsFetch = 0;
const SCHOLARSHIP_CACHE_TTL = 60 * 1000;

export async function getActiveScholarships() {
  const now = Date.now();
  if (cachedActiveScholarships && now - lastScholarshipsFetch < SCHOLARSHIP_CACHE_TTL) {
    return cachedActiveScholarships;
  }
  const res = await db.query('SELECT * FROM scholarships WHERE status = $1', ['ACTIVE']);
  cachedActiveScholarships = res.rows || [];
  lastScholarshipsFetch = now;
  return cachedActiveScholarships;
}

export function invalidateScholarshipsCache() {
  cachedActiveScholarships = null;
  lastScholarshipsFetch = 0;
}

export const getScholarships = async (req, res, next) => {
  try {
    const {
      search,
      course,
      state,
      category,
      income,
      cgpa,
      amount,
      sort = 'deadline',
    } = req.query;

    // Fetch active scholarships (from cache or DB) and user data in parallel
    const activePromise = getActiveScholarships();
    let studentPromise = Promise.resolve(null);
    let savedPromise = Promise.resolve({ rows: [] });

    if (req.user && req.user.id) {
      studentPromise = db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
      savedPromise = db.query('SELECT scholarship_id FROM saved_scholarships WHERE user_id = $1', [req.user.id]);
    }

    const [activeRows, sRes, savedRes] = await Promise.all([
      activePromise,
      studentPromise,
      savedPromise,
    ]);

    let list = [...activeRows];

    // Filter by search (name or provider or description)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.provider && s.provider.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    // Filter by course
    if (course && course.trim()) {
      const c = course.trim().toLowerCase();
      list = list.filter(s => {
        const eligible = Array.isArray(s.course_eligibility)
          ? s.course_eligibility
          : (typeof s.course_eligibility === 'string' ? JSON.parse(s.course_eligibility || '[]') : []);
        return eligible.some(e => e.toLowerCase() === 'all' || e.toLowerCase().includes(c) || c.includes(e.toLowerCase()));
      });
    }

    // Filter by state
    if (state && state.trim()) {
      const st = state.trim().toLowerCase();
      list = list.filter(s => {
        const states = Array.isArray(s.eligible_states)
          ? s.eligible_states
          : (typeof s.eligible_states === 'string' ? JSON.parse(s.eligible_states || '[]') : []);
        return states.some(e => e.toLowerCase() === 'all india' || e.toLowerCase() === 'all' || e.toLowerCase().includes(st));
      });
    }

    // Filter by category
    if (category && category.trim()) {
      const cat = category.trim().toLowerCase();
      list = list.filter(s => {
        const categories = Array.isArray(s.eligible_categories)
          ? s.eligible_categories
          : (typeof s.eligible_categories === 'string' ? JSON.parse(s.eligible_categories || '[]') : []);
        return categories.some(e => e.toLowerCase() === 'all' || e.toLowerCase() === cat);
      });
    }

    // Filter by maximum family income
    if (income) {
      const inc = Number(income);
      if (!isNaN(inc) && inc > 0) {
        list = list.filter(s => !s.maximum_income || Number(s.maximum_income) >= inc);
      }
    }

    // Filter by CGPA
    if (cgpa) {
      const studentCgpa = Number(cgpa);
      if (!isNaN(studentCgpa) && studentCgpa > 0) {
        list = list.filter(s => !s.minimum_cgpa || Number(s.minimum_cgpa) <= studentCgpa);
      }
    }

    // Filter by Minimum Amount
    if (amount) {
      const amt = Number(amount);
      if (!isNaN(amt) && amt > 0) {
        list = list.filter(s => Number(s.amount) >= amt);
      }
    }

    // Process authenticated matching & saved status
    let student = sRes && sRes.rows && sRes.rows.length > 0 ? sRes.rows[0] : null;
    let savedIds = new Set();
    if (savedRes && savedRes.rows) {
      savedRes.rows.forEach(r => savedIds.add(r.scholarship_id));
    }

    list = list.map(item => {
      let matchInfo = { matchScore: 70, eligible: true };
      if (student) {
        matchInfo = calculateMatchScore(student, item);
      }
      return {
        ...item,
        matchScore: matchInfo.matchScore,
        eligible: matchInfo.eligible,
        isSaved: savedIds.has(item.id),
      };
    });

    // Sort list
    if (sort === 'match') {
      list.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sort === 'amount_desc') {
      list.sort((a, b) => Number(b.amount) - Number(a.amount));
    } else if (sort === 'amount_asc') {
      list.sort((a, b) => Number(a.amount) - Number(b.amount));
    } else if (sort === 'recent') {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else {
      // Default: sort by deadline ascending (soonest deadline first)
      list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    res.json({
      success: true,
      count: list.length,
      scholarships: list,
    });
  } catch (err) {
    next(err);
  }
};

export const getScholarshipById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sRes = await db.query('SELECT * FROM scholarships WHERE id = $1', [id]);
    if (!sRes.rows || sRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    const scholarship = sRes.rows[0];
    let isSaved = false;
    let application = null;
    let matchResult = null;

    if (req.user && req.user.id) {
      // Execute saved, application, and student checks in parallel
      const [savedRes, appRes, stRes] = await Promise.all([
        db.query(
          'SELECT id FROM saved_scholarships WHERE user_id = $1 AND scholarship_id = $2',
          [req.user.id, id]
        ),
        db.query(
          'SELECT * FROM applications WHERE user_id = $1 AND scholarship_id = $2',
          [req.user.id, id]
        ),
        db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]),
      ]);

      isSaved = Boolean(savedRes.rows && savedRes.rows.length > 0);
      if (appRes.rows && appRes.rows.length > 0) {
        application = appRes.rows[0];
      }
      if (stRes.rows && stRes.rows.length > 0) {
        matchResult = calculateMatchScore(stRes.rows[0], scholarship);
      }
    }

    res.json({
      success: true,
      scholarship: {
        ...scholarship,
        isSaved,
        application,
        matchResult,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createScholarship = async (req, res, next) => {
  try {
    const data = req.body;
    const insertRes = await db.query(
      `INSERT INTO scholarships (
        name, provider, description, amount, course_eligibility, minimum_cgpa,
        maximum_income, eligible_states, eligible_categories, gender_requirement,
        age_requirement, required_documents, deadline, official_url, application_method,
        verified, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        data.name,
        data.provider,
        data.description,
        data.amount,
        JSON.stringify(data.course_eligibility || ['All']),
        data.minimum_cgpa || 0,
        data.maximum_income || 0,
        JSON.stringify(data.eligible_states || ['All India']),
        JSON.stringify(data.eligible_categories || ['All']),
        data.gender_requirement || 'All',
        data.age_requirement || 100,
        JSON.stringify(data.required_documents || []),
        data.deadline,
        data.official_url,
        data.application_method || 'Online Portal',
        data.verified !== undefined ? data.verified : true,
        data.status || 'ACTIVE',
      ]
    );

    invalidateScholarshipsCache();
    res.status(201).json({
      success: true,
      message: 'Scholarship created successfully.',
      scholarship: insertRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const updateScholarship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updateRes = await db.query(
      `UPDATE scholarships SET
        name = $1, provider = $2, description = $3, amount = $4, course_eligibility = $5,
        minimum_cgpa = $6, maximum_income = $7, eligible_states = $8, eligible_categories = $9,
        gender_requirement = $10, age_requirement = $11, required_documents = $12,
        deadline = $13, official_url = $14, application_method = $15, verified = $16, status = $17,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $18 RETURNING *`,
      [
        data.name,
        data.provider,
        data.description,
        data.amount,
        JSON.stringify(data.course_eligibility || ['All']),
        data.minimum_cgpa || 0,
        data.maximum_income || 0,
        JSON.stringify(data.eligible_states || ['All India']),
        JSON.stringify(data.eligible_categories || ['All']),
        data.gender_requirement || 'All',
        data.age_requirement || 100,
        JSON.stringify(data.required_documents || []),
        data.deadline,
        data.official_url,
        data.application_method || 'Online Portal',
        data.verified !== undefined ? data.verified : true,
        data.status || 'ACTIVE',
        id,
      ]
    );

    if (!updateRes.rows || updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    invalidateScholarshipsCache();
    res.json({
      success: true,
      message: 'Scholarship updated successfully.',
      scholarship: updateRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const deleteScholarship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const delRes = await db.query('DELETE FROM scholarships WHERE id = $1', [id]);
    invalidateScholarshipsCache();
    res.json({
      success: true,
      message: 'Scholarship removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};
