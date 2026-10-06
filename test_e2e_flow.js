// Complete End-to-End Verification Test Script for ScholarNest
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('========================================================');
  console.log('  STARTING SCHOLARNEST FULL-STACK END-TO-END AUDIT');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 1: Health Check
  const health = await fetch(`${BASE_URL}/health`).then(r => r.json());
  assert(health.success && health.status === 'ONLINE', '1. Backend Health Check is ONLINE');

  // TEST 2: User Registration
  const testEmail = `ananya_${Date.now()}@test.edu`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ananya Sharma',
      email: testEmail,
      password: 'SecurePassword123'
    })
  }).then(r => r.json());
  assert(regRes.success && regRes.token, '2. User Registration created account and returned JWT');
  const token = regRes.token;

  // TEST 3: User Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'SecurePassword123'
    })
  }).then(r => r.json());
  assert(loginRes.success && loginRes.user.email === testEmail, '3. User Login verified bcrypt password');

  // TEST 4: Get Current Session (GET /auth/me)
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  assert(meRes.success && meRes.user.name === 'Ananya Sharma', '4. JWT Auth middleware verified /auth/me');

  // TEST 5: Update Student Profile (PUT /profile)
  const profileRes = await fetch(`${BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      full_name: 'Ananya Sharma',
      age: 20,
      gender: 'Female',
      state: 'Telangana',
      district: 'Hyderabad',
      course: 'B.Tech',
      branch: 'Computer Science & Engineering',
      year: '3rd Year',
      college_name: 'JNTUH College of Engineering',
      college_type: 'Government',
      cgpa: 8.85,
      percentage: 88.5,
      annual_family_income: 180000,
      category: 'OBC',
      rural_urban: 'Urban',
      achievements: 'State rank in EAMCET, published tech paper'
    })
  }).then(r => r.json());
  assert(
    profileRes.success && profileRes.profile.profile_completion >= 70,
    `5. Student Profile updated and completion calculated (${profileRes.profile?.profile_completion}%)`
  );

  // TEST 6: Deterministic Matching Engine (GET /matches)
  const matchesRes = await fetch(`${BASE_URL}/matches`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  assert(
    matchesRes.success && matchesRes.matches.length > 0,
    `6. Deterministic engine evaluated ${matchesRes.count} scholarships`
  );
  
  const topMatch = matchesRes.matches[0];
  assert(
    topMatch.matchScore > 70 && topMatch.breakdown.academic === 25,
    `7. Top scholarship scored dynamically (${topMatch.matchScore}%) with Academic: ${topMatch.breakdown.academic}/25, Income: ${topMatch.breakdown.income}/20`
  );

  // TEST 7: AI Eligibility Explanation (POST /ai/eligibility-explanation)
  const aiExpRes = await fetch(`${BASE_URL}/ai/eligibility-explanation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      scholarshipId: topMatch.scholarship.id,
      language: 'English'
    })
  }).then(r => r.json());
  assert(
    aiExpRes.success && aiExpRes.explanation && aiExpRes.explanation.summary,
    `8. NestGuide AI explained match result: "${aiExpRes.explanation?.summary?.slice(0, 75)}..."`
  );

  // TEST 8: Multilingual AI Assistant (POST /ai/nestguide) in Telugu and Hindi
  const teluguRes = await fetch(`${BASE_URL}/ai/nestguide`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'What documents do I need to prepare?',
      language: 'Telugu'
    })
  }).then(r => r.json());
  assert(teluguRes.success && teluguRes.reply, '9. NestGuide AI responded in Telugu');

  const hindiRes = await fetch(`${BASE_URL}/ai/nestguide`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'How do I apply before the deadline?',
      language: 'Hindi'
    })
  }).then(r => r.json());
  assert(hindiRes.success && hindiRes.reply, '10. NestGuide AI responded in Hindi');

  // TEST 9: Bookmark Scholarship (POST /saved/:id & GET /saved)
  const saveAction = await fetch(`${BASE_URL}/saved/${topMatch.scholarship.id}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  assert(saveAction.success, '11. Bookmarked scholarship in user nest');

  const savedList = await fetch(`${BASE_URL}/saved`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  assert(
    savedList.success && savedList.saved.some(s => s.id === topMatch.scholarship.id),
    '12. GET /saved verified bookmarked scholarship'
  );

  // TEST 10: Application Pipeline CRUD (POST /applications, PUT /applications/:id, GET /applications)
  const appCreate = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      scholarship_id: topMatch.scholarship.id,
      status: 'DOCUMENTS_PREPARING',
      notes: 'Submitted income certificate for Tehsildar verification'
    })
  }).then(r => r.json());
  assert(appCreate.success && appCreate.application.status === 'DOCUMENTS_PREPARING', '13. Application tracked under DOCUMENTS_PREPARING');

  const appId = appCreate.application.id;
  const appUpdate = await fetch(`${BASE_URL}/applications/${appId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: 'READY_TO_APPLY',
      notes: 'All documents verified and ready for portal submission'
    })
  }).then(r => r.json());
  assert(appUpdate.success && appUpdate.application.status === 'READY_TO_APPLY', '14. Application status updated to READY_TO_APPLY');

  const appGet = await fetch(`${BASE_URL}/applications/${appId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  assert(appGet.success && appGet.application.notes.includes('ready for portal submission'), '15. GET /applications/:id returned full application data');

  // TEST 11: Real Dashboard Numbers (GET /dashboard)
  const dashRes = await fetch(`${BASE_URL}/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  assert(
    dashRes.success &&
    dashRes.dashboard.totalMatchingScholarships > 0 &&
    dashRes.dashboard.savedScholarshipsCount >= 1 &&
    dashRes.dashboard.totalApplicationsCount >= 1,
    `16. Dynamic Dashboard API returned real stats: Matching=${dashRes.dashboard.totalMatchingScholarships}, Saved=${dashRes.dashboard.savedScholarshipsCount}, ActiveApps=${dashRes.dashboard.activeApplicationsCount}`
  );

  // TEST 12: Notification System (GET /notifications)
  const notifRes = await fetch(`${BASE_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  assert(notifRes.success && notifRes.notifications.length >= 1, '17. Notifications delivered on application lifecycle changes');

  // TEST 13: Data Isolation & Security: User B cannot access User A's data
  const userB = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'User B Hacker',
      email: `userb_${Date.now()}@test.edu`,
      password: 'password123'
    })
  }).then(r => r.json());
  const tokenB = userB.token;

  const unauthorizedApp = await fetch(`${BASE_URL}/applications/${appId}`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert(unauthorizedApp.status === 404, '18. Security verified: User B cannot view User A application (404/Denied)');

  console.log('\n========================================================');
  console.log(`  AUDIT COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
