require('dotenv').config();

// Get an instance of the Postgres driver we can use in the app
const { Pool } = require('pg');

// Create a 'connection pool' using Neon's connection string
var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Neon requires SSL
});

// Export it for use in the application
module.exports.pool = pool;
