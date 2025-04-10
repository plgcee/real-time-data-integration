import { queryRDS1 } from '../../lib/db';

/**
 * API endpoint to edit a record in the products table
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract data from the request body
  const { id, name, quantity, price, databaseName } = req.body;

  // Validate that all fields are present
  if (!id) {
    return res.status(400).json({ 
      success: false,
      error: 'Record ID is required' 
    });
  }

  if (!name || quantity === undefined || price === undefined) {
    return res.status(400).json({ 
      success: false,
      error: 'Name, quantity, and price are required fields' 
    });
  }

  if (!databaseName) {
    return res.status(400).json({ 
      success: false,
      error: 'Database name is required' 
    });
  }

  try {
    // SQL query to update the record
    const query = `
      UPDATE products
      SET name = $1, quantity = $2, price = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const values = [name, quantity, price, id];

    // Execute the query
    const result = await queryRDS1(query, values, databaseName);

    // If a record was updated, return the updated record
    if (result.rows.length > 0) {
      res.status(200).json({
        success: true,
        message: 'Record updated successfully',
        data: result.rows[0],
        database: databaseName
      });
    } else {
      res.status(404).json({ 
        success: false,
        error: 'Record not found',
        database: databaseName
      });
    }
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update record',
      message: error.message,
      database: databaseName
    });
  }
}
