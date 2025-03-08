const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const axios = require("axios");

// Initialize JWKS client to fetch public key dynamically
const client = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
});

// Helper function to get the signing key
const getKey = (header, callback) => {
  // kid mean Key ID in the JWT header
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

//Function to refresh access token
const refreshAccessToken = async (refreshToken) => {
  try {
    const tokenEndpoint = `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const response = await axios.post(
      tokenEndpoint,
      new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data; // Contains new access_token, refresh_token, expires_in
  } catch (error) {
    console.error(
      "Token refresh failed",
      error.response?.data || error.response
    );
    return null;
  }
};

// Authentication Middleware with automatic refresh
const authenticateUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  const refreshToken = req.cookies.refresh;

  console.log("JWT Token:", token); // Log to check if token is received
  console.log("Refresh Token:", refreshToken); // Log to check if refresh token is received

  if (!token) {
    return res.status(401).json({
      message: "Not authenticated",
      loginEndpoint: "/api/v1/auth/login",
    });
  }

  // Verify JWT dynamically using Keycloak's public key
  jwt.verify(token, getKey, { algorithms: ["RS256"] }, async (err, decoded) => {
    if (err && err.name === "TokenExpiredError" && refreshToken !== null) {
      console.log("Access token expired, attempting to refresh...");

      //Try refreshing the token
      const newTokens = await refreshAccessToken(refreshToken);

      if (newTokens !== null) {
        // Store the new tokens in cookies
        res.cookie("jwt", newTokens.access_token, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
        // sameSite: "lax",
        sameSite: "None",
        secure: true, // Required when sameSite is None
          maxAge: newTokens.expires_in * 1000,
        });

        res.cookie("refresh", newTokens.refresh_token, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
        // sameSite: "lax",
        sameSite: "None",
        secure: true, // Required when sameSite is None
          maxAge: 24 * 60 * 60 * 1000,
        });

        //Decode new access token
        jwt.verify(
          newTokens.access_token,
          getKey,
          { algorithms: ["RS256"] },
          (err, newDecoded) => {
            if (err) {
              console.error("Error verifying new token:", err);
              return res
                .status(403)
                .json({ message: "Forbidden. Invalid new token." });
            }
            req.user = newDecoded; // Update req.user with new decoded info
            next(); // Continue request
          }
        );
      } else {
        return res
          .status(401)
          .json({ message: "Session expired. Please log in again." });
      }
    } else if (err) {
      return res
        .status(403)
        .jason({ message: "Forbidden. Invalid or expired token." });
    } else {
      req.user = decoded; // Store decoded user info
      next();
    }
  });
};

module.exports = authenticateUser;
