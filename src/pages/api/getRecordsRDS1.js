import { queryRDS1 } from '../../lib/db';

/**
 * API endpoint to fetch records from the products table in RDS1
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { databaseName } = req.query;
  const dbToUse = databaseName || process.env.RDS1_DATABASE || 'postgres';

  try {
    // First check if the table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) AS table_exists;
    `;
    
    const tableExistsResult = await queryRDS1(tableExistsQuery, [], dbToUse);
    const tableExists = tableExistsResult.rows[0]?.table_exists || false;
    
    if (!tableExists) {
      return res.status(200).json({
        success: true,
        data: [],
        database: dbToUse,
        message: 'Table does not exist in the database'
      });
    }

    // Fetch records from the products table
    const result = await queryRDS1(
      'SELECT id, name, price, quantity FROM products',
      [],
      dbToUse
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      database: dbToUse
    });
  } catch (error) {
    console.error('❌ Error in API:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch records',
      message: error.message,
      database: dbToUse
    });
  }
}
