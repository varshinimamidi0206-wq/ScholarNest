import { db } from '../config/db.js';
import { calculateMatchScore } from '../services/matchingService.js';

// In-memory cache for active scholarships (TTL 60s) to avoid repeated database hits
let cachedActiveScholarships = null;
let lastScholarshipsFetch = 0;
const SCHOLARSHIP_CACHE_TTL = 60 * 1000;

async function getActiveScholarships() {
  const now = Date.now();
  if (cachedActiveScholarships && now - lastScholarshipsFetch < SCHOLARSHIP_CACHE_TTL) {
    return cachedActiveScholarships;
  }
  const res = await db.query('SELECT * FROM scholarships WHERE status = $1', ['ACTIVE']);
  cachedActiveScholarships = res.rows || [];
  lastScholarshipsFetch = now;
  return cachedActiveScholarships;
}

export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Run independent database queries in parallel
    const [studentRes, savedRes, appsRes, allScholarships] = await Promise.all([
      db.query('SELECT * FROM students WHERE user_id = $1', [userId]),
      db.query('SELECT count(*) FROM saved_scholarships WHERE user_id = $1', [userId]),
      db.query(
        `SELECT a.id, a.scholarship_id, a.status, a.notes, a.applied_at as applied_date, a.updated_at,
                s.name as scholarship_name, s.provider, s.amount, s.deadline
         FROM applications a
         JOIN scholarships s ON a.scholarship_id = s.id
         WHERE a.user_id = $1
         ORDER BY a.updated_at DESC`,
        [userId]
      ),
      getActiveScholarships(),
    ]);

    const student = (studentRes.rows && studentRes.rows[0]) || { profile_completion: 0 };
    const savedCount = parseInt(savedRes.rows[0]?.count, 10) || 0;
    const applications = appsRes.rows || [];
    const activeApplicationsCount = applications.filter(a => !['REJECTED', 'SAVED'].includes(a.status)).length;

    let matchingCount = 0;
    const scoredScholarships = allScholarships.map(s => {
      const match = calculateMatchScore(student, s);
      if (match.eligible && match.matchScore >= 60) {
        matchingCount += 1;
      }
      return {
        ...s,
        matchScore: match.matchScore,
        eligible: match.eligible,
      };
    });

    // 5. Upcoming Deadlines (within 45 days, sorted by closest deadline)
    const now = new Date();
    const upcomingDeadlines = allScholarships
      .map(s => {
        const d = new Date(s.deadline);
        const diffTime = d - now;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const app = applications.find(a => a.scholarship_id === s.id);
        return {
          id: s.id,
          name: s.name,
          provider: s.provider,
          amount: s.amount,
          deadline: s.deadline,
          daysLeft,
          applicationStatus: app ? app.status : null,
          isUrgent: daysLeft >= 0 && daysLeft <= 14,
          isExpired: daysLeft < 0,
        };
      })
      .filter(s => s.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    // 6. Application status distribution
    const statusCounts = {
      SAVED: 0,
      INTERESTED: 0,
      DOCUMENTS_PREPARING: 0,
      READY_TO_APPLY: 0,
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
    };
    applications.forEach(app => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status] += 1;
      }
    });

    // 7. Top 3 Recommended Scholarships
    scoredScholarships.sort((a, b) => b.matchScore - a.matchScore);
    const topRecommended = scoredScholarships.slice(0, 3);

    res.json({
      success: true,
      dashboard: {
        userName: req.user.name,
        profileCompletion: Number(student.profile_completion) || 0,
        totalMatchingScholarships: matchingCount,
        savedScholarshipsCount: savedCount,
        activeApplicationsCount,
        totalApplicationsCount: applications.length,
        upcomingDeadlines,
        statusCounts,
        recentApplications: applications.slice(0, 4),
        topRecommended,
      },
    });
  } catch (err) {
    next(err);
  }
};
