const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_URL,
  max: process.env.DB_MAX_CONNECTIONS || 20, // Max number of connections (adjust based on server capacity)
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000, // Close idle connections after 30 sec
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 20000, // Return error if connection takes longer than 20 sec
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
    console.log("Connected to PostgreSQL");
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});

pool.on("acquire", () => {
    console.log("Connection acquired from pool");
});

pool.on("remove", () => {
    console.log("Connection removed from pool");
});

module.exports = pool;