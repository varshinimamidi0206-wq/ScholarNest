import app, { ensureDbReady } from '../backend/src/server.js';

export default async function handler(req, res) {
  // Support Vercel rewritten path header
  if (req.headers['x-matched-path']) {
    req.url = req.headers['x-matched-path'];
  }

  try {
    await ensureDbReady();
  } catch (err) {
    console.warn('[Vercel API] DB ready warning:', err.message);
  }

  return new Promise((resolve) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', resolve);
    app(req, res);
  });
}
