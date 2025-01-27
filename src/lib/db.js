const { Pool } = require('pg');

// Configure the RDS connections\
let db1Pool;
let db2Pool;

// Connect to databases RDS1
const connectDB1 = async (databaseName) => {

  const databaseToConnect = databaseName || process.env.RDS1_DATABASE;

  let dbPool = db1Pool

  // If the pool doesn't exist or the database is different, create a new pool
  if (!dbPool || dbPool.database !== databaseToConnect) {
    dbPool = new Pool({
      host: process.env.RDS1_HOST,
      port: process.env.RDS1_PORT || 5432,
      user: process.env.RDS1_USER,
      password: process.env.RDS1_PASSWORD,
      database: databaseToConnect,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  try {
    const client = await dbPool.connect();
    console.log('Connected to RDS1');
    client.release();
  } catch (err) {
    console.error('Error connecting to databases:', err);
    throw new Error('Could not connect to the database');
  }
  return dbPool;
};

// Connect to databases RDS1
const connectDB2 = async () => {
  if (db2Pool) return db2Pool;
  db2Pool = new Pool({
    host: process.env.RDS2_HOST,
    port: process.env.RDS2_PORT || 5432,
    user: process.env.RDS2_USER,
    password: process.env.RDS2_PASSWORD,
    database: process.env.RDS2_DATABASE,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  try {
    const client = await db2Pool.connect();
    console.log('Connected to RDS2');
    client.release();
  } catch (err) {
    console.error('Error connecting to databases:', err);
    throw new Error('Could not connect to the database');
  }
  return db2Pool;
};


// Close connections
const closeConnections = async () => {
  await db1Pool.end();
  await db2Pool.end();
};

module.exports = { connectDB1, connectDB2, closeConnections };
