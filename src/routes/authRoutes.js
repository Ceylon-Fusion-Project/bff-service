const express = require("express");
const router = express.Router();
const axios = require("axios");
const authenticateUser = require("../middlewares/authMiddleware");

module.exports = (keycloak) => {
  router.get("/login", (req, res) => {
    const redirectUrl = "http://localhost:5173";  // Frontend URL where users go after login
    const loginUrl =
      process.env.KEYCLOAK_AUTH_SERVER_URL +
      `/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth` +
      `?client_id=${process.env.KEYCLOAK_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(
        process.env.BFF_URL + "/api/v1/auth/callback"
      )}` +
      `&scope=openid`;

    req.session.afterLogin = redirectUrl;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Session not saved" });
      }
      return res.redirect(loginUrl);
    });
  });

  // Registration endpoint
  router.get("/signup", (req, res) => {
    const registerUrl =
      `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/registrations` +
      `?client_id=${process.env.KEYCLOAK_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(
        process.env.BFF_URL + "/api/v1/auth/callback"
      )}`;
    res.redirect(registerUrl);
  });

  // 2) Callback from Keycloak after user logs in
  router.get("/callback", async (req, res) => {
    // Get the authorization code from Keycloak
    // (Here 'Code' came as a response of keycloak after login)
    const { code } = req.query;

    // if (!code) {
    //   return res.status(400).json({ error: "Authorization code missing" });
    // }
    if (!code) {
      return sendErrorResponse(res, 400, "Authorization code missing");
    }
    

    try {
      // Exchange authorization code for JWT tokens
      const tokenEndpoint = `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

      const response = await axios.post(
        tokenEndpoint,
        new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: `${process.env.BFF_URL}/api/v1/auth/callback`,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      //extract response data after axios request
      const { access_token, refresh_token, expires_in } = response.data;
      console.log("🔑 Received Access Token:", access_token); // ✅ Log Access Token
      console.log("🔄 Received Refresh Token:", refresh_token);

      // Store tokens in HTTP-only cookies
      res.cookie("jwt", access_token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        // sameSite: "lax",
        //secure: true,
        sameSite: 'none',
        secure: true,
        //secure: false,//for development
        maxAge: expires_in * 1000, // Convert expiration to milliseconds
      });

      res.cookie("refresh", refresh_token, {
        httpOnly: true,
       // secure: process.env.NODE_ENV === "production",
        // sameSite: "lax",
        //secure: true,
        sameSite: 'none',
        secure: true, // Required when sameSite is None
        //secure: false,//for development
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      req.session.authenticated = true;

    const redirectUrl = req.session.afterLogin || process.env.FRONTEND_URL;
    delete req.session.afterLogin;

    req.session.save(() => {
      res.redirect(redirectUrl);
    });
    } catch (error) {
      console.error(
        "Error during token exchange:",
        error.response?.data || error.message
      );
      return sendErrorResponse(res, 500, "Token exchange failed");
    }
  });

  // Logout endpoint 
  router.get("/logout", async (req, res) => {

    try {
      const refreshToken = req.cookies.refresh;

      if (refreshToken) {
        //call Keycloak to revoke the refresh token
        await axios.post(
          `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
          new URLSearchParams({
            client_id: process.env.KEYCLOAK_CLIENT_ID,
            client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
            refresh_token: refreshToken,
          }),
          {headers: {"content-Type": "application/x-www-form-urlencoded"}}
        );
      }

      res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
      res.clearCookie("refresh", { httpOnly: true, sameSite: "None", secure: true });

      const logoutUrl =
      `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout?redirect_uri=${process.env.FRONTEND_URL}`;

      req.session.destroy((err) => {
        if (err) console.error("Error destroying session",err);
        res.redirect(logoutUrl);
      });
    } catch (err) {
      console.error("Logout error:", error);
      return sendErrorResponse(res, 500, "Logout failed");
    }
  });

  //Check authenticated status from frontend
  router.get("/check",authenticateUser, (req, res) => {
    console.log("🔍 Checking Auth. Cookies:", req.cookies); // ✅ Log received cookies
    if (req.cookies.jwt) {
      return res.status(200).json({ authenticated: true });
    }
    return sendErrorResponse(res, 401, "Not authenticated. Please log in.");
  });

  //refresh token endpoint that call from frontend
  router.get("/refresh", async (req, res) => {
    const refreshToken = req.cookies.refresh;
  
    if (!refreshToken) {
      return sendErrorResponse(res, 401, "Refresh token missing");
    }
  
    try {
      const tokenEndpoint = `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
      
      //sends a request to Keycloak to exchange the refresh token for a new access token
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
  
      const { access_token, refresh_token, expires_in } = response.data;
  
      // Update cookies with the new tokens
      res.cookie("jwt", access_token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        // sameSite: "lax",
        sameSite: "none",
        secure: true,
        //secure: false,//for development
        maxAge: expires_in * 1000,
      });
  
      res.cookie("refresh", refresh_token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        // sameSite: "lax",
        //secure: true,
        sameSite:'none',
        secure: true, // Required when sameSite is None
        //secure: false,//for development
        maxAge: 24 * 60 * 60 * 1000,
      });
  
      res.status(200).json({ message: "Token refreshed" });
    } catch (error) {
      console.error("Token refresh failed:", error.response?.data || error.message);
      res.status(403).json({ error: "Refresh failed" });
    }
  });  

  return router;
};
