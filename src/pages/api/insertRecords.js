// pages/api/inserRecords.js
import { queryRDS1 } from '../../lib/db';

/**
 * API endpoint to insert records into the products table
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { databaseName, products } = req.body;

  // Validate input
  if (!databaseName) {
    return res.status(400).json({ 
      success: false,
      error: 'Database name is required' 
    });
  }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ 
      success: false,
      error: 'Products array is required and must not be empty' 
    });
  }

  // Validate each product
  for (const product of products) {
    const { name, price, quantity } = product;
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Each product must have name, price, and quantity fields' 
      });
    }
  }

  try {
    // Start a transaction
    await queryRDS1('BEGIN', [], databaseName);

    // Insert each product
    for (const product of products) {
      const { name, price, quantity } = product;
      
      await queryRDS1(
        'INSERT INTO products (name, price, quantity) VALUES ($1, $2, $3) RETURNING id',
        [name, price, quantity],
        databaseName
      );
    }

    // Commit the transaction
    await queryRDS1('COMMIT', [], databaseName);

    res.status(200).json({ 
      success: true,
      message: `${products.length} records inserted successfully`,
      database: databaseName
    });
  } catch (error) {
    // Rollback the transaction on error
    try {
      await queryRDS1('ROLLBACK', [], databaseName);
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }

    console.error('Error inserting records:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to insert records',
      message: error.message,
      database: databaseName
    });
  }
}
