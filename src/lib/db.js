const { Client } = require('pg');

// Configure the RDS connections
const db1Client = new Client({
  host: process.env.RDS1_HOST,
  port: process.env.RDS1_PORT || 5432,
  user: process.env.RDS1_USER,
  password: process.env.RDS1_PASSWORD,
  database: process.env.RDS1_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

const db2Client = new Client({
  host: process.env.RDS2_HOST,
  port: process.env.RDS2_PORT || 5432,
  user: process.env.RDS2_USER,
  password: process.env.RDS2_PASSWORD,
  database: process.env.RDS2_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Connect to both databases
const connectDB = async () => {
  try {
    await db1Client.connect();
    console.log('Connected to RDS1');
    await db2Client.connect();
    console.log('Connected to RDS2');
  } catch (err) {
    console.error('Error connecting to databases:', err);
  }
};

// Close connections
const closeConnections = async () => {
  await db1Client.end();
  await db2Client.end();
};

module.exports = { db1Client, db2Client, connectDB, closeConnections };
