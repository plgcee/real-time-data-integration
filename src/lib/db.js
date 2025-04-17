import { Pool } from 'pg';

// Connection pools
let poolRDS1 = null;
let poolRDS2 = null;
let currentDatabaseName = null;

// Idle timeout in milliseconds (5 minutes)
const IDLE_TIMEOUT = 5 * 60 * 1000;

// Last activity timestamp
let lastActivityTime = Date.now();

// Function to update last activity time
export const updateLastActivity = () => {
  lastActivityTime = Date.now();
};

// Function to check and close idle connections
export const checkAndCloseIdleConnections = () => {
  const currentTime = Date.now();
  if (currentTime - lastActivityTime > IDLE_TIMEOUT) {
    if (poolRDS1) {
      poolRDS1.end();
      poolRDS1 = null;
      currentDatabaseName = null;
    }
    if (poolRDS2) {
      poolRDS2.end();
      poolRDS2 = null;
    }
    console.log('Closed idle database connections');
  }
};

// Function to get RDS1 connection pool
const getPoolRDS1 = (databaseName) => {
  // If database name has changed or pool doesn't exist, create new pool
  if (!poolRDS1 || currentDatabaseName !== databaseName) {
    if (poolRDS1) {
      poolRDS1.end();
    }
    poolRDS1 = new Pool({
      host: process.env.RDS1_HOST,
      port: process.env.RDS1_PORT,
      user: process.env.RDS1_USER,
      password: process.env.RDS1_PASSWORD,
      database: databaseName || process.env.RDS1_DATABASE || 'postgres',
      ssl: {
        rejectUnauthorized: false
      }
    });
    currentDatabaseName = databaseName;
    console.log(`Created new connection pool for database: ${databaseName}`);
  }
  return poolRDS1;
};

// Function to get RDS2 connection pool
const getPoolRDS2 = () => {
  if (!poolRDS2) {
    poolRDS2 = new Pool({
      host: process.env.RDS2_HOST,
      port: process.env.RDS2_PORT,
      user: process.env.RDS2_USER,
      password: process.env.RDS2_PASSWORD,
      database: process.env.RDS2_DATABASE,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return poolRDS2;
};

// Function to execute query on RDS1
export const queryRDS1 = async (text, params = [], databaseName) => {
  updateLastActivity();
  const pool = getPoolRDS1(databaseName);
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Error executing query on RDS1:', error);
    throw error;
  }
};

// Function to execute query on RDS2
export const queryRDS2 = async (text, params = [], schemaName = 'public') => {
  updateLastActivity();
  const pool = getPoolRDS2();
  try {
    // Set the search path for this query
    await pool.query(`SET search_path TO ${schemaName}`);
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Error executing query on RDS2:', error);
    throw error;
  }
};

// Set up periodic connection cleanup
setInterval(checkAndCloseIdleConnections, IDLE_TIMEOUT);

// Clean up connections on process exit
process.on('SIGINT', () => {
  if (poolRDS1) poolRDS1.end();
  if (poolRDS2) poolRDS2.end();
  process.exit();
});
