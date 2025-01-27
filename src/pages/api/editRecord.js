import { connectDB1 } from '../../lib/db';

let db1Pool;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract data from the request body
  const { id, name, quantity, price, databaseName } = req.body;

  // Validate that all fields are present
  if (!id || !name || quantity == null || price == null) {
    return res.status(400).json({ error: 'Missing required fields (id, name, quantity, price)' });
  }

  try {
    // Ensure the database connection pool is initialized
    if (!db1Pool) {
      db1Pool = await connectDB1(databaseName); // You may want to pass databaseName if required
    } else {
        if (!db1Pool.options.database != databaseName) {
            db1Pool = await connectDB1(databaseName)
        }
    }

    const pool = await db1Pool.connect();

    // SQL query to update the record
    const query = `
      UPDATE products
      SET name = $1, quantity = $2, price = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [name, quantity, price, id];

    // Execute the query
    const result = await pool.query(query, values);

    // If a record was updated, return the updated record
    if (result.rows.length > 0) {
      res.status(200).json({
        success: true,
        message: 'Record updated successfully',
        updatedRecord: result.rows[0], // Return the updated record
      });
    } else {
      res.status(404).json({ error: 'Record not found' });
    }

    pool.release(); // Release the connection back to the pool
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
