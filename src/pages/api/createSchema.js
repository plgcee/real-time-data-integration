// pages/api/createSchema.js
import { connectDB2 } from '../../lib/db'; // Adjust import as per your DB connection setup

export default async function handler(req, res) {
  // Ensure this only runs on POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get schema name from the request body
  const { schemaName } = req.body;

  // Check if schema name is provided
  if (!schemaName) {
    return res.status(400).json({ error: 'Schema name is required' });
  }

  try {
    const pool = await connectDB2();

    // Create the schema dynamically based on the provided name
    const query = `CREATE SCHEMA IF NOT EXISTS ${schemaName}`;
    const query1 = `GRANT USAGE, CREATE ON SCHEMA  ${schemaName} to workshopq1;`;
    const result = await pool.query(query);
    await pool.query(query1);

    // Return success message or result
    res.status(200).json({ message: `Schema '${schemaName}' created successfully`, result });

  } catch (error) {
    console.error('Error creating schema:', error);
    res.status(500).json({ error: 'Failed to create schema' });
  }
}
