import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false,
  max: 5,
});

export async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ma_runs (
      id          uuid PRIMARY KEY,
      token       text UNIQUE NOT NULL,
      trouble     text NOT NULL,
      stage       text NOT NULL DEFAULT 'read',
      status      text NOT NULL DEFAULT 'working',
      excerpt     text,
      report      jsonb,
      email       text,
      ip          text,
      created_at  timestamptz NOT NULL DEFAULT now(),
      emailed_at  timestamptz
    );
  `);
}

export const q = (text, params) => pool.query(text, params);
