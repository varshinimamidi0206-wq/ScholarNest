import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { config } from '../config/env.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

export const register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);
    const email = validated.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    // Create user
    const insertUser = await db.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
      [validated.name.trim(), email, passwordHash]
    );

    const user = insertUser.rows[0];

    // Initialize student profile record
    await db.query(
      `INSERT INTO students (user_id, full_name, profile_completion) VALUES ($1, $2, $3)`,
      [user.id, user.name, 10]
    );

    // Create welcome notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
      [
        user.id,
        'Welcome to ScholarNest!',
        'Complete your academic and family profile to discover personalized scholarships.',
        'PROFILE',
      ]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    if (err.errors) {
      return res.status(400).json({
        success: false,
        message: err.errors[0].message,
      });
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    const email = validated.email.toLowerCase().trim();

    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!userRes.rows || userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(validated.password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    if (err.errors) {
      return res.status(400).json({
        success: false,
        message: err.errors[0].message,
      });
    }
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userRes = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
    if (!userRes.rows || userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const studentRes = await db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);

    res.json({
      success: true,
      user: userRes.rows[0],
      student: studentRes.rows[0] || null,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};
