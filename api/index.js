import app, { ensureDbReady } from '../backend/src/server.js';

export default async function handler(req, res) {
  await ensureDbReady();
  return app(req, res);
}
