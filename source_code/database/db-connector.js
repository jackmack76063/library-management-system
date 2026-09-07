/* Citation for the original version of this function:
Date: 11/21/2024
Adapted from CS 340: nodejs-starter-app (db-connector.js)
Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%200%20-%20Setting%20Up%20Node.js

Updated for deployment: swapped the 'mysql' driver for 'pg' (node-postgres)
to connect to a Neon Postgres database instead of the class MySQL server.
*/

require('dotenv').config();

// Get an instance of the Postgres driver we can use in the app
const { Pool } = require('pg');

// Create a 'connection pool' using Neon's connection string
// Neon gives you one full connection string instead of separate host/user/password fields
var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Neon requires SSL
});

// Export it for use in our application
module.exports.pool = pool;
