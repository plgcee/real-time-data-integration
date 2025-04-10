const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

async function runMigration() {
  const pool = new Pool({
    host: process.env.RDS1_HOST || 'localhost',
    port: process.env.RDS1_PORT || 5432,
    user: process.env.RDS1_USER || 'postgres',
    password: process.env.RDS1_PASSWORD || '',
    database: process.env.RDS1_DATABASE || 'postgres',
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '001_create_products_table.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    console.log('Running migration...');
    await client.query(migrationSQL);
    
    console.log('Migration completed successfully!');
    client.release();
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error); 