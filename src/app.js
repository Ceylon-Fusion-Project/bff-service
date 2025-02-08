const express = require("express");
const session = require('express-session');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require('dotenv').config();

// Import Keycloak initialization and routes
const {initKeycloak} = require('./config/keycloak');

// Initialize Express application
const app = express();

app.use(helmet());// Add security headers to all HTTP responses
app.use(morgan('combined'));// Log all HTTP requests in a 'combined' format 
app.use(cors());// Enable Cross-Origin Resource Sharing 
app.use(express.json());// Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true }));// Parse URL-encoded request bodies

// Create an in-memory session store (not suitable for production, consider using Redis or a database)
const memoryStore = new session.MemoryStore();


//set up express-session
app.use(
  session({
    secret: 'someRandomSecretValue',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

// Define the Keycloak configuration parameters
const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM,//realm
  "auth-server-url": process.env.KEYCLOAK_AUTH_SERVER_URL, // Keycloak server URL
  "ssl-required": "external", // SSL is required for external requests
  resource: process.env.KEYCLOAK_RESOURCE || process.env.KEYCLOAK_CLIENT_ID, // Client ID
  credentials: {
    secret: process.env.KEYCLOAK_CLIENT_SECRET, // Client secret for authentication
  },
  "confidential-port": 0, // Default port for confidential clients
  "bearer-only": true, // Indicates the client is bearer-only and does not require a Keycloak login page
};

// Initialize Keycloak once, with our memoryStore & config
const keycloak = initKeycloak(memoryStore, keycloakConfig);

// Attach the Keycloak middleware so routes can use `keycloak.protect()`
app.use(keycloak.middleware());

//Load main router, passing the *initialized* keycloak instance.
const indexRoutes = require("./routes")(keycloak);

//Main Router
app.use('/', indexRoutes);

module.exports = app;