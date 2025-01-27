// pages/api/getRecordsRDS2.js
import { connectDB2 } from '../../lib/db';

let db2Pool;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const { schemaName } = req.query;
    if (!schemaName) {
        return res.status(400).json({ error: 'Schema name is required' });
    }

  try {
    if (!db2Pool) {
      db2Pool = await connectDB2();
    }
    const existsQuery = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = $1
        AND table_name = $2
      ) AS table_exists;
    `;
    const pool = await db2Pool.connect();
    const result = await pool.query(existsQuery, [schemaName, "db_public_products"]);
    if (result.rows[0].table_exists) {
        const result2 = await pool.query(`SELECT id, name, quantity, price FROM ${schemaName}.db_public_products`);
        return res.status(200).json(result2.rows);
      } else {
        return res.status(200).json([]);
      }
  } catch (error) {
    console.error('Error fetching records from RDS2:', error);
    res.status(500).json({ error: 'Failed to fetch records from RDS2' });
  }
}
