import { db } from '../config/db.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifs = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );

    res.json({
      success: true,
      count: notifs.rows ? notifs.rows.length : 0,
      notifications: notifs.rows || [],
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (err) {
    next(err);
  }
};
