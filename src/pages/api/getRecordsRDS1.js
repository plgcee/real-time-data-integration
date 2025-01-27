// pages/api/getRecordsRDS1.js
import { connectDB1 } from '../../lib/db';

let db1Pool;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { databaseName } = req.query;

  if (!databaseName) {
      return res.status(400).json({ error: 'Database name is required' });
  }
  try {
    if (!db1Pool) {
      db1Pool = await connectDB1(databaseName);
    } else {
      if (db1Pool.options.database != databaseName) {
        db1Pool = await connectDB1(databaseName);
      }
    }
    const pool = await db1Pool.connect();

    const result = await pool.query('SELECT id, name, price, quantity FROM products');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching records from RDS1:', error);
    res.status(500).json({ error: 'Failed to fetch records from RDS1' });
  }
}