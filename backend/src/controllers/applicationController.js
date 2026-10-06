import { db } from '../config/db.js';

export const getApplications = async (req, res, next) => {
  try {
    const appsRes = await db.query(
      `SELECT a.*, s.name as scholarship_name, s.provider, s.amount, s.deadline, s.official_url, s.required_documents
       FROM applications a
       JOIN scholarships s ON a.scholarship_id = s.id
       WHERE a.user_id = $1
       ORDER BY a.updated_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      count: appsRes.rows ? appsRes.rows.length : 0,
      applications: appsRes.rows || [],
    });
  } catch (err) {
    next(err);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appRes = await db.query(
      `SELECT a.*, s.name as scholarship_name, s.provider, s.amount, s.deadline, s.official_url, s.required_documents
       FROM applications a
       JOIN scholarships s ON a.scholarship_id = s.id
       WHERE a.user_id = $1 AND a.id = $2`,
      [req.user.id, id]
    );

    if (!appRes.rows || appRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
    }

    res.json({
      success: true,
      application: appRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const { scholarship_id, status = 'INTERESTED', notes = '' } = req.body;

    if (!scholarship_id) {
      return res.status(400).json({ success: false, message: 'scholarship_id is required.' });
    }

    // Verify scholarship exists
    const sCheck = await db.query('SELECT id, name FROM scholarships WHERE id = $1', [scholarship_id]);
    if (!sCheck.rows || sCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    // Check if application already exists for this user and scholarship
    const existing = await db.query(
      'SELECT id FROM applications WHERE user_id = $1 AND scholarship_id = $2',
      [req.user.id, scholarship_id]
    );

    if (existing.rows && existing.rows.length > 0) {
      // Update existing
      const updated = await db.query(
        `UPDATE applications SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 AND user_id = $4 RETURNING *`,
        [status, notes, existing.rows[0].id, req.user.id]
      );
      return res.json({
        success: true,
        message: 'Application status updated.',
        application: updated.rows[0],
      });
    }

    const applied_at = status === 'APPLIED' ? new Date().toISOString() : null;

    const inserted = await db.query(
      `INSERT INTO applications (user_id, scholarship_id, status, notes, applied_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, scholarship_id, status, notes, applied_at]
    );

    // Create notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
      [
        req.user.id,
        'Application Tracked',
        `Started tracking application for ${sCheck.rows[0].name} with status ${status}.`,
        'APPLICATION',
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Application tracking started.',
      application: inserted.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Check ownership
    const existing = await db.query(
      'SELECT id, status FROM applications WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
    }

    const validStatuses = [
      'SAVED',
      'INTERESTED',
      'DOCUMENTS_PREPARING',
      'READY_TO_APPLY',
      'APPLIED',
      'UNDER_REVIEW',
      'SELECTED',
      'REJECTED',
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const applied_at = status === 'APPLIED' ? new Date().toISOString() : undefined;

    const updated = await db.query(
      `UPDATE applications SET
        status = COALESCE($1, status),
        notes = COALESCE($2, notes),
        applied_at = COALESCE($3, applied_at),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [status || null, notes !== undefined ? notes : null, applied_at || null, id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Application updated successfully.',
      application: updated.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const del = await db.query('DELETE FROM applications WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({
      success: true,
      message: 'Application removed from tracker.',
    });
  } catch (err) {
    next(err);
  }
};
