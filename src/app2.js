const express = require("express");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Import from centralized redis.js
const { sessionStore } = require("./config/redis");;

// Import Keycloak initialization
const { initKeycloak } = require('./config/keycloak');

//Import Global Rate Limiter
const { globalLimiter } = require('./middlewares/rateLimiter');

//Import saveOriginal Url
//const saveOriginalUrl = require('./middlewares/saveOriginalUrl');

// Initialize Express application
const app = express();

// ✅ Remove manual CORS headers and use only cors package
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3001"], // Allow Frontend & BFF
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "X-Idempotency-Key"], // ✅ Include custom header
}));

// If behind a proxy like NGINX or Vite dev server
app.set('trust proxy', 1); // Trust first proxy (if applicable)

// Handle Preflight Requests
app.options("*", cors());

app.use(cookieParser());
app.use(globalLimiter);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      //secure: process.env.NODE_ENV === 'production', //Only works with HTTPS
      secure: false, //Allows session cookies in development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    }
  })
);

// Save original URL middleware
//app.use(saveOriginalUrl);

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
const keycloak = initKeycloak(sessionStore, keycloakConfig);

// Apply Keycloak middleware
app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/admin'
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