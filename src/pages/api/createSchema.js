// pages/api/createSchema.js
import { queryRDS2 } from '../../lib/db';

/**
 * API endpoint to create a new schema in the target database
 */
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

  // Validate schema name to prevent SQL injection
  if (!/^[a-zA-Z0-9_]+$/.test(schemaName)) {
    return res.status(400).json({ error: 'Invalid schema name. Use only letters, numbers, and underscores.' });
  }

  try {
    // Check if schema already exists
    const checkSchemaQuery = `SELECT 1 FROM information_schema.schemata WHERE schema_name = $1`;
    const existingSchema = await queryRDS2(checkSchemaQuery, [schemaName]);

    if (existingSchema.rowCount === 0) {
      // Create the schema
      const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`;
      await queryRDS2(createSchemaQuery);
      console.log(`Schema '${schemaName}' created successfully.`);
    } else {
      console.log(`Schema '${schemaName}' already exists.`);
    }

    // Grant permissions to the workshop user
    const grantQuery = `GRANT USAGE, CREATE ON SCHEMA "${schemaName}" TO workshopq1`;
    await queryRDS2(grantQuery);
    console.log(`Permissions granted on schema '${schemaName}'.`);
    
    // Return success message
    res.status(200).json({ 
      success: true,
      message: `Schema '${schemaName}' created successfully`,
      schemaName: schemaName
    });

  } catch (error) {
    console.error('Error creating schema:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create schema',
      message: error.message 
    });
  }
}
