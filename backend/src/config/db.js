import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { config } from './env.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? '/tmp' : path.resolve(__dirname, '../../data');
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem fallback
}
const LOCAL_DB_FILE = path.join(DATA_DIR, 'scholarnest_local.json');

// Default initial state for local storage
const defaultData = {
  users: [],
  students: [],
  scholarships: [],
  saved_scholarships: [],
  applications: [],
  documents: [],
  notifications: [],
  ai_outputs: [],
};

// Seed scholarships list
const seedScholarships = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Central Sector Scheme of Scholarships for College and University Students',
    provider: 'Ministry of Education, Government of India',
    description: 'Provides financial assistance to meritorious students from low-income families to meet day-to-day expenses while pursuing higher studies in colleges and universities.',
    amount: 20000,
    course_eligibility: ['All', 'B.Tech', 'B.Sc', 'B.Com', 'B.A', 'MBBS'],
    minimum_cgpa: 7.5,
    maximum_income: 450000,
    eligible_states: ['All India'],
    eligible_categories: ['All', 'General', 'OBC', 'SC', 'ST', 'EWS'],
    gender_requirement: 'All',
    age_requirement: 25,
    required_documents: ['Income Certificate', 'Academic Marksheet', 'Aadhaar Card', 'Bonafide Certificate', 'Bank Passbook'],
    deadline: '2026-11-30',
    official_url: 'https://scholarships.gov.in',
    application_method: 'National Scholarship Portal (NSP)',
    verified: true,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Reliance Foundation Undergraduate Scholarship',
    provider: 'Reliance Foundation',
    description: 'Supports meritorious undergraduate students across all disciplines with comprehensive grant and mentorship support through their degree programs.',
    amount: 200000,
    course_eligibility: ['B.Tech', 'B.Sc', 'B.Com', 'B.A', 'BBA', 'B.Des'],
    minimum_cgpa: 8.0,
    maximum_income: 1500000,
    eligible_states: ['All India'],
    eligible_categories: ['All'],
    gender_requirement: 'All',
    age_requirement: 22,
    required_documents: ['Class 12 Marksheet', 'College ID / Bonafide', 'Family Income Certificate', 'Aadhaar Card'],
    deadline: '2026-10-25',
    official_url: 'https://www.scholarships.reliancefoundation.org',
    application_method: 'Reliance Foundation Portal',
    verified: true,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Adobe India Women-in-Technology Scholarship',
    provider: 'Adobe Systems India',
    description: 'Recognizes outstanding female students pursuing degrees in Computer Science, AI, and related Engineering disciplines, aiming to close the gender gap in tech leadership.',
    amount: 100000,
    course_eligibility: ['B.Tech', 'M.Tech', 'B.E', 'Dual Degree CSE/IT/ECE'],
    minimum_cgpa: 8.5,
    maximum_income: 2500000,
    eligible_states: ['All India'],
    eligible_categories: ['All'],
    gender_requirement: 'Female',
    age_requirement: 26,
    required_documents: ['Resume', 'College Marksheet', 'Bonafide Certificate', 'Technical Essay', 'Recommendation Letter'],
    deadline: '2026-11-15',
    official_url: 'https://www.adobe.com/in/careers/university/women-in-technology.html',
    application_method: 'Adobe Careers Portal',
    verified: true,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'AICTE Pragati Scholarship Scheme for Girl Students',
    provider: 'All India Council for Technical Education (AICTE)',
    description: 'Empowers young women to pursue technical diploma and degree education by providing annual tuition and sustenance grants.',
    amount: 50000,
    course_eligibility: ['B.Tech', 'B.Arch', 'B.Pharmacy', 'Diploma Engineering'],
    minimum_cgpa: 7.0,
    maximum_income: 800000,
    eligible_states: ['All India'],
    eligible_categories: ['All', 'General', 'OBC', 'SC', 'ST'],
    gender_requirement: 'Female',
    age_requirement: 24,
    required_documents: ['AICTE College Admission Proof', 'Income Certificate', 'Caste Certificate', 'Academic Marksheet', 'Aadhaar Card'],
    deadline: '2026-12-10',
    official_url: 'https://www.aicte-india.org/schemes/students-development-schemes/pragati',
    application_method: 'National Scholarship Portal',
    verified: true,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'ONGC Merit Scholarship for SC/ST and OBC Students',
    provider: 'ONGC Foundation',
    description: 'Provides substantial financial support to disadvantaged students enrolled in Engineering, Medical (MBBS), and Masters in Geophysics/Geology or MBA programs.',
    amount: 48000,
    course_eligibility: ['B.Tech', 'MBBS', 'MBA', 'M.Sc Geophysics'],
    minimum_cgpa: 6.5,
    maximum_income: 200000,
    eligible_states: ['All India'],
    eligible_categories: ['SC', 'ST', 'OBC'],
    gender_requirement: 'All',
    age_requirement: 30,
    required_documents: ['Caste Certificate', 'Income Certificate', 'College Bonafide', 'Semester Marksheet', 'Bank Passbook'],
    deadline: '2026-11-05',
    official_url: 'https://www.ongcscholar.org',
    application_method: 'ONGC Foundation Portal',
    verified: true,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Telangana ePASS Post-Matric Overseas & State Scholarship',
    provider: 'Government of Telangana Welfare Department',
    description: 'Comprehensive fee reimbursement and maintenance allowance for SC, ST, BC, and EBC students studying in colleges across Telangana.',
    amount: 35000,
    course_eligibility: ['B.Tech', 'Degree', 'B.Pharmacy', 'MBA', 'MCA', 'Medical'],
    minimum_cgpa: 6.0,
    maximum_income: 200000,
    eligible_states: ['Telangana'],
    eligible_categories: ['SC', 'ST', 'OBC', 'EWS'],
    gender_requirement: 'All',
    age_requirement: 28,
    required_documents: ['Telangana Nativity Certificate', 'Income Certificate', 'Caste Certificate', 'Aadhaar Card', 'Bonafide Certificate'],
    deadline: '2026-10-31',
    official_url: 'https://telanganaepass.cgg.gov.in',
    application_method: 'Telangana ePASS Portal',
    verified: true,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    name: 'Tata Trust Medical and Healthcare Professional Grant',
    provider: 'Tata Trusts Education Grants',
    description: 'Supports undergraduate and postgraduate students enrolled in recognized medical, nursing, and dental institutions in India.',
    amount: 75000,
    course_eligibility: ['MBBS', 'BDS', 'B.Sc Nursing', 'BAMS', 'BHMS'],
    minimum_cgpa: 7.5,
    maximum_income: 500000,
    eligible_states: ['All India'],
    eligible_categories: ['All'],
    gender_requirement: 'All',
    age_requirement: 27,
    required_documents: ['College Fee Receipt', 'Annual Family Income Proof', 'Yearly Marksheet', 'Identity Card', 'Statement of Need'],
    deadline: '2026-12-15',
    official_url: 'https://www.tatatrusts.org/our-work/individual-grants-programme/education-grants',
    application_method: 'Tata Trusts Grants Portal',
    verified: true,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    name: 'Kotak Kanya Scholarship for Girl Students',
    provider: 'Kotak Education Foundation',
    description: 'Assists talented girls from low-income families in completing professional graduation courses including engineering, architecture, design, and medicine.',
    amount: 150000,
    course_eligibility: ['B.Tech', 'MBBS', 'B.Des', 'B.Arch', 'B.Pharma', 'Integrated LLB'],
    minimum_cgpa: 8.0,
    maximum_income: 320000,
    eligible_states: ['All India'],
    eligible_categories: ['All'],
    gender_requirement: 'Female',
    age_requirement: 23,
    required_documents: ['Class 12 Marksheet', 'Income Certificate', 'College Admission Letter', 'Aadhaar Card', 'Parent ID Proof'],
    deadline: '2026-11-20',
    official_url: 'https://kotakeducation.org/kotak-kanya-scholarship/',
    application_method: 'Kotak Education Portal',
    verified: true,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    name: 'Sitaram Jindal Foundation Educational Scholarship',
    provider: 'Sitaram Jindal Foundation',
    description: 'Financial scholarship for needy meritorious students pursuing Diploma, Degree, Technical, and Postgraduate programs.',
    amount: 24000,
    course_eligibility: ['All', 'B.Tech', 'B.Sc', 'B.Com', 'Diploma'],
    minimum_cgpa: 6.5,
    maximum_income: 400000,
    eligible_states: ['All India'],
    eligible_categories: ['All'],
    gender_requirement: 'All',
    age_requirement: 25,
    required_documents: ['Previous Exam Marksheet', 'Income Certificate', 'Bonafide Certificate', 'Bank Passbook'],
    deadline: '2026-12-31',
    official_url: 'https://www.sitaramjindalfoundation.org/scholarships.php',
    application_method: 'Foundation Direct Application',
    verified: true,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000010',
    name: 'Post-Matric Scholarship Scheme for Minorities',
    provider: 'Ministry of Minority Affairs, Govt of India',
    description: 'Scholarship scheme encouraging students belonging to minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) to continue higher education.',
    amount: 12000,
    course_eligibility: ['All', 'B.Tech', 'Degree', 'Medical', 'Arts', 'Commerce'],
    minimum_cgpa: 5.5,
    maximum_income: 250000,
    eligible_states: ['All India'],
    eligible_categories: ['Minority'],
    gender_requirement: 'All',
    age_requirement: 30,
    required_documents: ['Minority Community Declaration', 'Income Certificate', 'Marksheet', 'Bank Passbook', 'Aadhaar Card'],
    deadline: '2026-10-20',
    official_url: 'https://scholarships.gov.in',
    application_method: 'National Scholarship Portal',
    verified: true,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class DatabaseService {
  constructor() {
    this.isPostgres = Boolean(config.DATABASE_URL);
    this.pool = null;
    this.localData = null;
  }

  parseConnectionString(urlString) {
    try {
      const lastAt = urlString.lastIndexOf('@');
      const protoEnd = urlString.indexOf('://');
      if (lastAt !== -1 && protoEnd !== -1) {
        const authPart = urlString.slice(protoEnd + 3, lastAt);
        const hostPart = urlString.slice(lastAt + 1);
        const colonIdx = authPart.indexOf(':');
        let user = colonIdx !== -1 ? authPart.slice(0, colonIdx) : authPart;
        let password = colonIdx !== -1 ? decodeURIComponent(authPart.slice(colonIdx + 1)) : '';
        const slashIdx = hostPart.indexOf('/');
        const hostPort = slashIdx !== -1 ? hostPart.slice(0, slashIdx) : hostPart;
        const database = slashIdx !== -1 ? hostPart.slice(slashIdx + 1).split('?')[0] : 'postgres';
        let [host, portStr] = hostPort.split(':');
        let port = portStr ? parseInt(portStr, 10) : 5432;

        // Auto-fix for Supabase direct IPv6 addresses (db.<ref>.supabase.co):
        // Automatically map to the official Supavisor IPv4 connection pooler
        const dbMatch = host.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
        if (dbMatch) {
          const ref = dbMatch[1];
          host = 'aws-0-ap-southeast-1.pooler.supabase.com';
          port = 6543;
          if (!user.includes('.')) {
            user = `postgres.${ref}`;
          }
        }

        return {
          user,
          password,
          host,
          port,
          database,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 10000,
          max: IS_VERCEL ? 2 : 10,
        };
      }
    } catch (e) {
      console.warn('[DB] Custom URL parsing failed, using standard string:', e.message);
    }

    return {
      connectionString: urlString,
      ssl: urlString.includes('localhost') ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      max: IS_VERCEL ? 2 : 10,
    };
  }

  async init() {
    if (this.isPostgres) {
      try {
        const poolConfig = this.parseConnectionString(config.DATABASE_URL);
        this.pool = new Pool(poolConfig);
        await this.pool.query('SELECT 1');
        console.log('[DB] Connected to PostgreSQL / Supabase successfully.');
        this.isPostgres = true;
        await this.runPostgresMigrations();
        return;
      } catch (err) {
        console.warn('[DB] PostgreSQL connection failed. Falling back to local persistent store.', err.message);
        this.isPostgres = false;
        if (this.pool) {
          try { await this.pool.end(); } catch (e) {}
          this.pool = null;
        }
      }
    }

    // Initialize local persistent JSON relational store
    this.loadLocalData();
    console.log('[DB] Using local persistent JSON relational store for development.');
  }

  loadLocalData() {
    const bundledSeed = path.resolve(__dirname, '../../data/scholarnest_local.json');
    if (fs.existsSync(LOCAL_DB_FILE)) {
      try {
        const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
        this.localData = JSON.parse(raw);
      } catch (e) {
        this.localData = { ...defaultData };
      }
    } else if (fs.existsSync(bundledSeed)) {
      try {
        const raw = fs.readFileSync(bundledSeed, 'utf-8');
        this.localData = JSON.parse(raw);
      } catch (e) {
        this.localData = { ...defaultData };
      }
    } else {
      this.localData = { ...defaultData };
    }

    // Ensure seed scholarships are present
    if (!this.localData.scholarships || this.localData.scholarships.length === 0) {
      this.localData.scholarships = [...seedScholarships];
      this.saveLocalData();
    }
  }

  saveLocalData() {
    try {
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(this.localData, null, 2), 'utf-8');
    } catch (e) {
      // In-memory persistence continues if filesystem is write-protected
    }
  }

  async runPostgresMigrations() {
    try {
      const candidates = [
        path.resolve(__dirname, '../../../database/schema.sql'),
        path.resolve(__dirname, '../../database/schema.sql'),
        path.resolve(process.cwd(), 'database/schema.sql'),
      ];
      const schemaPath = candidates.find(p => fs.existsSync(p));
      if (schemaPath) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        await this.pool.query(schemaSql);
        console.log('[DB] PostgreSQL schema checked/migrated.');
      }

      // Check if scholarships need seeding
      const res = await this.pool.query('SELECT count(*) FROM scholarships');
      if (parseInt(res.rows[0].count, 10) === 0) {
        const seedCandidates = [
          path.resolve(__dirname, '../../../database/seeds.sql'),
          path.resolve(__dirname, '../../database/seeds.sql'),
          path.resolve(process.cwd(), 'database/seeds.sql'),
        ];
        const seedPath = seedCandidates.find(p => fs.existsSync(p));
        if (seedPath) {
          const seedsSql = fs.readFileSync(seedPath, 'utf-8');
          await this.pool.query(seedsSql);
          console.log('[DB] PostgreSQL seed data injected.');
        }
      }
    } catch (err) {
      console.error('[DB] Migration error:', err.message);
    }
  }

  // Generic query runner supporting both PostgreSQL and our fallback store
  async query(text, params = []) {
    if (this.isPostgres && this.pool) {
      return await this.pool.query(text, params);
    }

    // Fallback SQL-like interpreter for local dev & demo
    return this.executeLocalQuery(text, params);
  }

  executeLocalQuery(text, params = []) {
    const sql = text.trim();
    const upper = sql.toUpperCase();

    // 1. SELECT queries
    if (upper.startsWith('SELECT')) {
      // Find table name
      const fromMatch = sql.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      if (!fromMatch) return { rows: [], rowCount: 0 };
      const table = fromMatch[1].toLowerCase();
      let rows = [...(this.localData[table] || [])];

      // Handle specific WHERE conditions with or without table aliases
      if (sql.includes('email = $1') || sql.includes('email =')) {
        const email = params[0];
        rows = rows.filter(r => r.email && r.email.toLowerCase() === (email || '').toLowerCase());
      } else if (/user_id\s*=\s*\$1/i.test(sql) && /scholarship_id\s*=\s*\$2/i.test(sql)) {
        rows = rows.filter(r => r.user_id === params[0] && r.scholarship_id === params[1]);
      } else if (/user_id\s*=\s*\$1/i.test(sql) && /\bid\s*=\s*\$2/i.test(sql)) {
        rows = rows.filter(r => r.user_id === params[0] && r.id === params[1]);
      } else if (/user_id\s*=\s*\$1/i.test(sql)) {
        rows = rows.filter(r => r.user_id === params[0]);
      } else if (/\bid\s*=\s*\$1/i.test(sql)) {
        rows = rows.filter(r => r.id === params[0]);
      } else if (/scholarship_id\s*=\s*\$1/i.test(sql)) {
        rows = rows.filter(r => r.scholarship_id === params[0]);
      }

      // If JOIN is present, enrich rows with joined table attributes (e.g. scholarships)
      if (sql.toUpperCase().includes('JOIN SCHOLARSHIPS')) {
        const scholarships = this.localData['scholarships'] || [];
        rows = rows.map(r => {
          const sch = scholarships.find(s => s.id === r.scholarship_id) || {};
          return {
            ...sch,
            ...r,
            scholarship_id: sch.id || r.scholarship_id,
            scholarship_name: sch.name || '',
            provider: sch.provider || '',
            amount: sch.amount || 0,
            deadline: sch.deadline || '',
            official_url: sch.official_url || '',
            required_documents: sch.required_documents || [],
          };
        });
      }

      // Handle COUNT(*) queries
      if (upper.includes('COUNT(')) {
        return { rows: [{ count: rows.length }], rowCount: 1 };
      }

      return { rows, rowCount: rows.length };
    }

    // 2. INSERT queries
    if (upper.startsWith('INSERT INTO')) {
      const match = sql.match(/INSERT INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (!match) return { rows: [], rowCount: 0 };
      const table = match[1].toLowerCase();
      const cols = match[2].split(',').map(c => c.trim().toLowerCase());
      
      const newRecord = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      cols.forEach((col, idx) => {
        newRecord[col] = params[idx] !== undefined ? params[idx] : null;
      });

      if (!this.localData[table]) this.localData[table] = [];
      this.localData[table].push(newRecord);
      this.saveLocalData();
      return { rows: [newRecord], rowCount: 1 };
    }

    // 3. UPDATE queries
    if (upper.startsWith('UPDATE')) {
      const match = sql.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/is);
      if (!match) return { rows: [], rowCount: 0 };
      const table = match[1].toLowerCase();
      const setClause = match[2];
      const whereClause = match[3];
      const records = this.localData[table] || [];

      // Find record to update
      let targetIndex = -1;
      if (whereClause.includes('user_id = $') && whereClause.includes('AND scholarship_id = $')) {
        const userId = params[params.length - 2];
        const schId = params[params.length - 1];
        targetIndex = records.findIndex(r => r.user_id === userId && r.scholarship_id === schId);
      } else if (whereClause.includes('id = $') && whereClause.includes('AND user_id = $')) {
        const id = params[params.length - 2];
        const userId = params[params.length - 1];
        targetIndex = records.findIndex(r => r.id === id && r.user_id === userId);
      } else if (whereClause.includes('user_id = $')) {
        const userId = params[params.length - 1];
        targetIndex = records.findIndex(r => r.user_id === userId);
      } else if (whereClause.includes('id = $')) {
        const id = params[params.length - 1];
        targetIndex = records.findIndex(r => r.id === id);
      }

      if (targetIndex !== -1) {
        // Parse column assignments: col = $N or col = COALESCE($N, col)
        const assignments = setClause.split(',');
        assignments.forEach(assign => {
          const parts = assign.split('=');
          if (parts.length >= 2) {
            const colName = parts[0].trim().toLowerCase();
            const rhs = parts[1].trim();
            const paramMatch = rhs.match(/\$(\d+)/);
            if (paramMatch) {
              const pIdx = parseInt(paramMatch[1], 10) - 1;
              if (params[pIdx] !== undefined) {
                // If COALESCE and param is null, keep previous
                if (rhs.toUpperCase().includes('COALESCE') && params[pIdx] === null) {
                  // keep existing
                } else {
                  records[targetIndex][colName] = params[pIdx];
                }
              }
            }
          }
        });

        records[targetIndex].updated_at = new Date().toISOString();
        this.saveLocalData();
        return { rows: [records[targetIndex]], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    }

    // 4. DELETE queries
    if (upper.startsWith('DELETE FROM')) {
      const match = sql.match(/DELETE FROM\s+([a-zA-Z0-9_]+)/i);
      if (!match) return { rows: [], rowCount: 0 };
      const table = match[1].toLowerCase();
      const records = this.localData[table] || [];

      let remaining = records;
      if (sql.includes('WHERE user_id = $1') && sql.includes('AND scholarship_id = $2')) {
        remaining = records.filter(r => !(r.user_id === params[0] && r.scholarship_id === params[1]));
      } else if (sql.includes('WHERE user_id = $1') && sql.includes('AND id = $2')) {
        remaining = records.filter(r => !(r.user_id === params[0] && r.id === params[1]));
      } else if (sql.includes('WHERE id = $1')) {
        remaining = records.filter(r => r.id !== params[0]);
      }

      const rowCount = records.length - remaining.length;
      this.localData[table] = remaining;
      this.saveLocalData();
      return { rows: [], rowCount };
    }

    return { rows: [], rowCount: 0 };
  }
}

export const db = new DatabaseService();
