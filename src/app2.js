const express = require("express");
const session = require('express-session');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const RedisStore = require('connect-redis').RedisStore;
const redis = require("ioredis");
require('dotenv').config();

// Import Keycloak initialization
const { initKeycloak } = require('./config/keycloak');

// Initialize Express application
const app = express();

// Security middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis client setup
const redisClient = redis.createClient({
  // host: process.env.REDIS_HOST,
  // port: process.env.REDIS_PORT,
  // password: process.env.REDIS_PASSWORD
  host: 'localhost',
  port: 6379,
  password: '2000319'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Session configuration with Redis
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    }
  })
);

// Keycloak configuration
const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM,
  "auth-server-url": process.env.KEYCLOAK_AUTH_SERVER_URL,
  "ssl-required": "external",
  resource: process.env.KEYCLOAK_CLIENT_ID,
  credentials: {
    secret: process.env.KEYCLOAK_CLIENT_SECRET
  },
  "confidential-port": 0,
  "bearer-only": false
};

// Initialize Keycloak
const keycloak = initKeycloak(app, keycloakConfig);

// Apply Keycloak middleware
app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/'
}));

// Load routes
const indexRoutes = require('./routes')(keycloak);
app.use('/', indexRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;