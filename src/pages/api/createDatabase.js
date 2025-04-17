// pages/api/createSchema.js
import { queryRDS1 } from '../../lib/db';
import { Pool } from 'pg';

/**
 * API endpoint to create a new database and initialize it with a products table
 */
export default async function handler(req, res) {
  // Ensure this only runs on POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get database name from the request body
  const { databaseName } = req.body;

  // Check if database name is provided
  if (!databaseName) {
    return res.status(400).json({ error: 'Database name is required' });
  }

  // Validate database name to prevent SQL injection
  if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
    return res.status(400).json({ error: 'Invalid database name. Use only letters, numbers, and underscores.' });
  }

  try {
    // Step 1: Check if the database exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const existingDb = await queryRDS1(checkDbQuery, [databaseName]);

    // Step 2: If the database does not exist, create it
    if (existingDb.rowCount === 0) {
      // Note: We can't use parameterized queries for CREATE DATABASE
      // So we need to be careful with the databaseName validation
      const createDbQuery = `CREATE DATABASE "${databaseName}"`;
      await queryRDS1(createDbQuery);
      console.log(`Database '${databaseName}' created successfully.`);
    } else {
      console.log(`Database '${databaseName}' already exists.`);
    }

    // Step 3: Connect to the new database and create the table
    const tableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create a new connection to the specific database
    const pool = new Pool({
      host: process.env.RDS1_HOST,
      port: process.env.RDS1_PORT,
      user: process.env.RDS1_USER,
      password: process.env.RDS1_PASSWORD,
      database: databaseName,
      ssl: {
        rejectUnauthorized: false
      }
    });

    try {
      // Execute table creation in the new database
      await pool.query(tableQuery);
      console.log('Table created successfully in the new database.');

      // Set up replication identity
      const updateReplicaQuery = `
        ALTER TABLE products REPLICA IDENTITY FULL;
      `;
      await pool.query(updateReplicaQuery);
      console.log('Replication identity set up successfully.');

      // Return success message
      res.status(200).json({ 
        success: true,
        message: `Database '${databaseName}' created and table 'products' added successfully.`,
        databaseName: databaseName
      });
    } finally {
      // Always close the connection
      await pool.end();
    }
    
  } catch (error) {
    console.error('Error creating Database / Table:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create Database / Table',
      message: error.message 
    });
  }
}
