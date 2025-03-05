const { Pool } = require("pg");
require("dotenv").config();

const isLocalhost = process.env.DB_URL.includes("localhost");

const pool = new Pool({
  connectionString: process.env.DB_URL,
  max: process.env.DB_MAX_CONNECTIONS || 20,
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 20000,
  ssl: isLocalhost ? false : { rejectUnauthorized: false }, // Disable SSL for localhost
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
