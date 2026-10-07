import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres.gufbigkfdhfysvcnbrpm',
  password: 'ScholarNest@02',
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

async function run() {
  try {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const seedsPath = path.resolve(__dirname, '../../database/seeds.sql');

    console.log('Reading schema from:', schemaPath);
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    console.log('Applying schema.sql to Supabase...');
    await pool.query(schemaSql);
    console.log('Schema applied successfully!');

    const res = await pool.query('SELECT count(*) FROM scholarships');
    console.log('Current scholarship count:', res.rows[0].count);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('Reading seeds from:', seedsPath);
      const seedsSql = fs.readFileSync(seedsPath, 'utf-8');
      console.log('Applying seeds.sql to Supabase...');
      await pool.query(seedsSql);
      console.log('Seeds applied successfully!');
    }

    const tablesRes = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('Public tables in Supabase:', tablesRes.rows.map(r => r.table_name));

    const usersRes = await pool.query('SELECT count(*) FROM users');
    console.log('Users in Supabase:', usersRes.rows[0].count);

    // Also copy existing local users from scholarnest_local.json into Supabase if any exist so no existing account is lost!
    const localDbPath = path.resolve(__dirname, '../data/scholarnest_local.json');
    if (fs.existsSync(localDbPath)) {
      const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      if (localData.users && localData.users.length > 0) {
        console.log(`Migrating ${localData.users.length} local users into Supabase...`);
        for (const u of localData.users) {
          try {
            await pool.query(
              `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (email) DO NOTHING`,
              [u.id, u.name, u.email.toLowerCase().trim(), u.password_hash, u.created_at || new Date(), u.updated_at || new Date()]
            );

            // Also migrate matching student record
            const st = (localData.students || []).find(s => s.user_id === u.id);
            if (st) {
              await pool.query(
                `INSERT INTO students (id, user_id, full_name, profile_completion, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (user_id) DO NOTHING`,
                [st.id, st.user_id, st.full_name || u.name, st.profile_completion || 10, st.created_at || new Date(), st.updated_at || new Date()]
              );
            } else {
              await pool.query(
                `INSERT INTO students (user_id, full_name, profile_completion)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id) DO NOTHING`,
                [u.id, u.name, 10]
              );
            }
          } catch (ue) {
            console.warn('Error inserting user', u.email, ue.message);
          }
        }
      }
    }

    const finalUsersRes = await pool.query('SELECT id, name, email FROM users');
    console.log('Final users in Supabase:', finalUsersRes.rows);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

run();
