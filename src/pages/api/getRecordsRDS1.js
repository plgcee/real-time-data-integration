// pages/api/getRecordsRDS1.js
import { db1Client, connectDB } from '../../lib/db';

export default async function handler(req, res) {
  try {
    if (!db1Client._connected) {
        await connectDB(); // Ensure DB is connected only if not already
      }
    const result = await db1Client.query('SELECT id, name, price, quantity FROM products');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching records from RDS1:', error);
    res.status(500).json({ error: 'Failed to fetch records from RDS1' });
  }
}
