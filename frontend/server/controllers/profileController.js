import { db } from '../config/db.js';
import { profileSchema } from '../validators/profileValidator.js';

function calculateCompletion(data) {
  const fields = [
    'full_name',
    'age',
    'state',
    'district',
    'course',
    'branch',
    'year',
    'college_name',
    'college_type',
    'cgpa',
    'percentage',
    'annual_family_income',
    'category',
    'gender',
    'disability_status',
    'minority_status',
    'rural_urban',
    'previous_scholarship',
    'achievements',
  ];

  let filledCount = 0;
  fields.forEach(f => {
    const val = data[f];
    if (val !== undefined && val !== null && val !== '') {
      filledCount += 1;
    }
  });

  return Math.min(100, Math.round((filledCount / fields.length) * 100));
}

export const getProfile = async (req, res, next) => {
  try {
    const studentRes = await db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    if (!studentRes.rows || studentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    res.json({
      success: true,
      profile: studentRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const validated = profileSchema.parse(req.body);
    const completion = calculateCompletion(validated);

    // Check if student profile exists
    const existing = await db.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);

    if (!existing.rows || existing.rows.length === 0) {
      const inserted = await db.query(
        `INSERT INTO students (
          user_id, full_name, age, state, district, course, branch, year, college_name,
          college_type, cgpa, percentage, annual_family_income, category, gender,
          disability_status, minority_status, rural_urban, previous_scholarship, achievements,
          profile_completion
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        ) RETURNING *`,
        [
          req.user.id,
          validated.full_name || null,
          validated.age || null,
          validated.state || null,
          validated.district || null,
          validated.course || null,
          validated.branch || null,
          validated.year || null,
          validated.college_name || null,
          validated.college_type || null,
          validated.cgpa || null,
          validated.percentage || null,
          validated.annual_family_income || null,
          validated.category || null,
          validated.gender || null,
          validated.disability_status || false,
          validated.minority_status || false,
          validated.rural_urban || 'Urban',
          validated.previous_scholarship || false,
          validated.achievements || null,
          completion,
        ]
      );
      return res.json({ success: true, message: 'Profile created successfully.', profile: inserted.rows[0] });
    }

    const updated = await db.query(
      `UPDATE students SET
        full_name = $1, age = $2, state = $3, district = $4, course = $5,
        branch = $6, year = $7, college_name = $8, college_type = $9, cgpa = $10,
        percentage = $11, annual_family_income = $12, category = $13, gender = $14,
        disability_status = $15, minority_status = $16, rural_urban = $17,
        previous_scholarship = $18, achievements = $19, profile_completion = $20,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $21 RETURNING *`,
      [
        validated.full_name || null,
        validated.age || null,
        validated.state || null,
        validated.district || null,
        validated.course || null,
        validated.branch || null,
        validated.year || null,
        validated.college_name || null,
        validated.college_type || null,
        validated.cgpa || null,
        validated.percentage || null,
        validated.annual_family_income || null,
        validated.category || null,
        validated.gender || null,
        validated.disability_status || false,
        validated.minority_status || false,
        validated.rural_urban || 'Urban',
        validated.previous_scholarship || false,
        validated.achievements || null,
        completion,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updated.rows[0],
    });
  } catch (err) {
    if (err.errors) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    next(err);
  }
};
