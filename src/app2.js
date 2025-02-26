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
const saveOriginalUrl = require('./middlewares/saveOriginalUrl');

// Initialize Express application
const app = express();

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//   // If this is an OPTIONS request, respond immediately.
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });

// Security middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));

// app.use(cors({
//   origin: ["http://localhost:5173", "http://localhost:3001"], // Allow Frontend & BFF
//   credentials: true,
//   methods: "GET, POST, PUT, DELETE, OPTIONS",
//   allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization,X-Idempotency-Key"
// }));

// ✅ Remove manual CORS headers and use only cors package
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3001"], // Allow Frontend & BFF
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "X-Idempotency-Key"], // ✅ Include custom header
}));

// Handle Preflight Requests
app.options("*", cors());

app.use(cookieParser());
app.use(globalLimiter);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Redis client setup
// const redisClient = redis.createClient({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT,
//   password: process.env.REDIS_PASSWORD
// });

//redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Session configuration with Redis
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
 app.use(saveOriginalUrl);

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