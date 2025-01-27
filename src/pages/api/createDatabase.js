// pages/api/createSchema.js
import { connectDB1 } from '../../lib/db'; // Adjust import as per your DB connection setup

export default async function handler(req, res) {
  // Ensure this only runs on POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get schema name from the request body
  const { databaseName } = req.body;

  // Check if schema name is provided
  if (!databaseName) {
    return res.status(400).json({ error: 'Database name is required' });
  }

  try {
    const pool = await connectDB1();

    // Step 1: Check if the database exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${databaseName}'`;
    const existingDb = await pool.query(checkDbQuery);

    // Step 2: If the database does not exist, create it
    if (existingDb.rowCount === 0) {
      const createDbQuery = `CREATE DATABASE ${databaseName}`;
      await pool.query(createDbQuery);
      console.log(`Database '${databaseName}' created successfully.`);
    } else {
      console.log(`Database '${databaseName}' already exists.`);
    }

    const newDbPool = await connectDB1(databaseName);

    // Step 4: Create the table in the new database
    const tableQuery = `
      CREATE TABLE IF NOT EXISTS public.products (
        id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
        name VARCHAR NULL,
        quantity INTEGER NULL,
        price DOUBLE PRECISION NULL
      );
    `;
    await newDbPool.query(tableQuery);
    console.log('Table created successfully in the new database.');
    const updateReplicaQuery = `
      ALTER TABLE ${databaseName}.public.products REPLICA IDENTITY FULL;
    `
    await newDbPool.query(updateReplicaQuery);

    // Return success message
    res.status(200).json({ message: `Database '${databaseName}' created and table 'products' added successfully.` });
    
  } catch (error) {
    console.error('Error creating Database / Table:', error);
    res.status(500).json({ error: 'Failed to create Database / Table' });
  }
}
