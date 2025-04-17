// pages/api/getRecordsRDS2.js
import { queryRDS2 } from '../../lib/db';

/**
 * API endpoint to fetch records from the products table in RDS2
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { schemaName } = req.query;
  const schemaToUse = schemaName || 'public';

  try {
    // First check if the table exists in the specified schema
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_name = 'db_public_products'
      ) AS table_exists;
    `;
    
    const tableExistsResult = await queryRDS2(tableExistsQuery, [schemaToUse]);
    const tableExists = tableExistsResult.rows[0]?.table_exists || false;
    
    if (!tableExists) {
      return res.status(200).json({
        success: true,
        data: [],
        schema: schemaToUse,
        message: 'Table does not exist in the schema'
      });
    }

    // Fetch records from the products table in the specified schema
    const result = await queryRDS2(
      `SELECT id, name, price, quantity FROM "${schemaToUse}".db_public_products`,
      []
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      schema: schemaToUse
    });
  } catch (error) {
    console.error('❌ Error in API:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch records',
      message: error.message,
      schema: schemaToUse
    });
  }
}
