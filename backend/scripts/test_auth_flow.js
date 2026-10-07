import { db } from '../src/config/db.js';
import { ensureDbReady } from '../src/server.js';

async function run() {
  await ensureDbReady();

  const testEmail = 'persistence_flow_' + Date.now() + '@example.com';
  const testPassword = 'SecurePassword!999';
  const testName = 'Scholar Test User';

  console.log('--- Step 1: Testing Registration via HTTP API ---');
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
  });
  const regData = await regRes.json();
  console.log('Register HTTP status:', regRes.status, regData);
  if (!regData.success) throw new Error('Registration failed: ' + regData.message);

  console.log('--- Step 2: Verify User Persisted in Supabase PostgreSQL ---');
  const dbCheck = await db.query('SELECT id, name, email FROM users WHERE email = $1', [testEmail.toLowerCase().trim()]);
  console.log('Database user verified:', dbCheck.rows[0]);
  if (!dbCheck.rows || dbCheck.rows.length === 0) throw new Error('User not found in DB!');

  console.log('--- Step 3: Testing Login with Same Credentials ---');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const loginData = await loginRes.json();
  console.log('Login HTTP status:', loginRes.status, loginData);
  if (!loginData.success) throw new Error('Login failed: ' + loginData.message);

  console.log('--- Step 4: Testing Login with UPPERCASE Email (Case Insensitivity) ---');
  const upperLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail.toUpperCase(), password: testPassword }),
  });
  const upperLoginData = await upperLoginRes.json();
  console.log('Uppercase Email Login status:', upperLoginRes.status, upperLoginData);
  if (!upperLoginData.success) throw new Error('Uppercase email login failed!');

  console.log('--- Step 5: Testing GET /api/auth/me with JWT Token ---');
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + loginData.token },
  });
  const meData = await meRes.json();
  console.log('/api/auth/me status:', meRes.status, meData);
  if (!meData.success) throw new Error('Auth me failed!');

  console.log('--- Step 6: Testing Invalid Password Rejection ---');
  const badLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword123' }),
  });
  const badLoginData = await badLoginRes.json();
  console.log('Bad Password status (should be 401):', badLoginRes.status, badLoginData.message);
  if (badLoginRes.status !== 401) throw new Error('Bad password was not rejected!');

  // Cleanup test user
  await db.query('DELETE FROM users WHERE id = $1', [regData.user.id]);
  console.log('--- ALL AUTH PERSISTENCE INTEGRATION TESTS PASSED 100% ---');
  process.exit(0);
}

run().catch((err) => {
  console.error('Integration test error:', err);
  process.exit(1);
});
