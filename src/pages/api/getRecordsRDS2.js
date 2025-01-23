// pages/api/getRecordsRDS2.js
import { db2Client, db1Client } from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const { schemaName } = req.query;
    if (!schemaName) {
        return res.status(400).json({ error: 'Schema name is required' });
    }
  try {
    if (!db1Client._connected) {
        await connectDB(); // Ensure DB is connected only if not already
      }
    const existsQuery = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = $1
        AND table_name = $2
      ) AS table_exists;
    `;
    const result = await db2Client.query(existsQuery, [schemaName, "db_public_products"]);
    if (result.rows[0].table_exists) {
        const result2 = await db2Client.query(`SELECT id, name, quantity, price FROM ${schemaName}.db_public_products`);
        return res.status(200).json(result2.rows);
      } else {
        return res.status(200).json([]);
      }
  } catch (error) {
    console.error('Error fetching records from RDS2:', error);
    res.status(500).json({ error: 'Failed to fetch records from RDS2' });
  }
}
