// pages/api/inserRecords.js
import { connectDB1 } from '../../lib/db';

let db1Pool;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { databaseName, products } = req.body;

    if (!databaseName || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Invalid data provided' });
    }

    // Construct SQL query for inserting records
    const insertQuery = `
      INSERT INTO products (name, price, quantity)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;
    if (!db1Pool) {
        console.log("No db1Pool")
        db1Pool = await connectDB1(databaseName);
    } else {
        console.log("db1Pool exists")
        if (db1Pool.options.database != databaseName) {
            console.log("db1Pool exists with databaseName: ",db1Pool.options.database)
            db1Pool = await connectDB1(databaseName);
        }
    }
    // Start a transaction to ensure atomicity
    const client = await db1Pool.connect();

    try {

      await client.query('BEGIN'); // Begin transaction

      for (const product of products) {
        const { name, price, quantity } = product;
        
        // Check if all required fields are provided
        if (!name || !price || !quantity) {
          return res.status(400).json({ message: 'Missing required product fields' });
        }

        // Insert product into the table
        await client.query(insertQuery, [name, price, quantity]);
      }

      // Commit the transaction if everything is fine
      await client.query('COMMIT');
      res.status(200).json({ message: 'Records inserted successfully' });
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback the transaction if something goes wrong
      console.error('Error inserting records:', error);
      res.status(500).json({ message: 'Failed to insert records', error: error.message });
    } finally {
      client.release(); // Release the client back to the pool
    }
  } else {
    // If the request method is not POST, return 405 Method Not Allowed
    res.status(405).json({ message: 'Method not allowed' });
  }
}
