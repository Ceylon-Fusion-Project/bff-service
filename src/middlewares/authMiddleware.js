const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

// Initialize JWKS client to fetch public key dynamically
const client = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`
});

// Helper function to get the signing key
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

// Authentication Middleware
const authenticateUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({
      message: "Not authenticated",
      loginEndpoint: "/api/v1/auth/login"
    });
  }

  // Verify JWT dynamically using Keycloak's public key
  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden. Invalid or expired token." });
    }
    
    req.user = decoded; // Store decoded user info
    next();
  });
};

module.exports = authenticateUser;
