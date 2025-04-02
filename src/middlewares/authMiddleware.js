const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const axios = require("axios");
const sendErrorResponse = require("../utils/sendErrorResponse");

// Initialize JWKS client to fetch public key dynamically from keycloak
const client = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
});

// Helper function to get the signing key from the JWKS endpoint
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

//Function to refresh access token for a new access token
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
    console.log(response.data);
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

  // 1) If there's **no access token**, but we DO have a refresh token:
  //    Attempt to refresh silently so the user remains authenticated.
  if (!token) {
    if (refreshToken) {
      console.log("No JWT token in request; attempting to refresh with refresh token...");

      const newTokens = await refreshAccessToken(refreshToken);
      if (!newTokens) {
        return sendErrorResponse(res, 401, "Session expired. Please log in again.");
      }

      console.log(`New Token: ${newTokens.access_token}`);
      // Re-set cookies
      res.cookie("jwt", newTokens.access_token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        //secure: false, // for development (use true + HTTPS in production)
        //secure: false, // for development (use true + HTTPS in production)
        maxAge: newTokens.expires_in * 1000, // token lifespan in ms
      });

      res.cookie("refresh", newTokens.refresh_token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        //secure: false, // for development (use true + HTTPS in production)
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      console.log(`New JWT:${token}`);
      console.log(`new RefreshToken:${refreshToken}`);

      // Now verify the newly obtained access token
      return jwt.verify(
        newTokens.access_token,
        getKey,
        { algorithms: ["RS256"] },
        (verifyErr, newDecoded) => {
          if (verifyErr) {
            console.error("❌ Error verifying new token:", verifyErr);
            return sendErrorResponse(res, 403, "Forbidden: Invalid new token after refresh.");
          }
          req.user = newDecoded;
          return next();
        }
      );
    }

    // If no token AND no refresh token, user isn't authenticated
    return sendErrorResponse(res, 401, "Not authenticated. Please log in.");
  }


  // 2) If there IS an access token, verify it dynamically using Keycloak's public key
  jwt.verify(token, getKey, { algorithms: ["RS256"] }, async (err, decoded) => {
    if (err) {
      // If token is expired, attempt refresh
      if (err.name === "TokenExpiredError" && refreshToken) {
        console.log("⚠️ Access token expired. Attempting refresh...");

        const newTokens = await refreshAccessToken(refreshToken);
        if (newTokens) {
          // ✅ Store the new tokens in cookies
          res.cookie("jwt", newTokens.access_token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            //secure: false,//for development
            maxAge: newTokens.expires_in * 1000,
          });

          res.cookie("refresh", newTokens.refresh_token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
          });

          // ✅ Decode new access token
          jwt.verify(
            newTokens.access_token,
            getKey,
            { algorithms: ["RS256"] },
            (verifyErr, newDecoded) => {
              if (verifyErr) {
                console.error("❌ Error verifying new token:", verifyErr);
                return sendErrorResponse(res, 403, "Forbidden: Invalid new token.");
              }
              req.user = newDecoded;
              next();
            }
          );
        } else {
          return sendErrorResponse(res, 401, "Session expired. Please log in again.");
        }
      } else {
        console.error("❌ Authentication failed:", err);
        return sendErrorResponse(res, 403, "Forbidden: Invalid or expired token.");
      }
    } else {
      req.user = decoded;
      next();
    }
  });
};

module.exports = authenticateUser;
