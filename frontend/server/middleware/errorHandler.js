import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.stack || err.message);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Sanitized message for production
  let message = err.message || 'An unexpected internal error occurred.';
  if (config.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An internal server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
