const express = require("express");
const router = express.Router();
const axios = require("axios");

module.exports = (keycloak) => {
  router.get("/login", (req, res) => {
    const redirectUrl = "http://localhost:5173"; // or wherever
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
  router.get("/register", (req, res) => {
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
    // req.session.authenticated = true;
    // // If we get here, keycloak.protect() handled the token exchange, user is logged in
    // const redirectUrl = req.session.afterLogin || process.env.FRONTEND_URL;
    // delete req.session.afterLogin;

    // req.session.save(() => {
    //     res.redirect(redirectUrl);
    //   });
    const { code } = req.query; // Get the authorization code from Keycloak

    if (!code) {
      return res.status(400).json({ error: "Authorization code missing" });
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

      const { access_token, refresh_token, expires_in } = response.data;

      // Store tokens in HTTP-only cookies
      res.cookie("jwt", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: expires_in * 1000, // Convert expiration to milliseconds
      });

      res.cookie("refresh", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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
      res.status(500).json({ error: "Token exchange failed" });
    }
  });

  // Logout endpoint
  router.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.clearCookie("refresh");

    const logoutUrl =
      `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout?redirect_uri=${process.env.FRONTEND_URL}`;

    req.session.destroy();
    res.redirect(logoutUrl);
  });

  //Check authenticated status
  router.get("/check", (req, res) => {
    // console.log("Session Data on /check:", req.session); // Debugging
    // console.log("Cookies in request:", req.headers.cookie); // Debugging

    // if (req.session.authenticated) {
    //   console.log("User is authenticated in session.");
    //   return res.status(200).json({ authenticated: true });
    // } else {
    //   console.log("User NOT authenticated in session.");
    //   return res.status(401).json({ authenticated: false });
    // }
    if (req.cookies.jwt) {
      return res.status(200).json({ authenticated: true });
    }
    return res.status(401).json({ authenticated: false });
  });

  //refresh token endpoint
  router.get("/refresh", async (req, res) => {
    const refreshToken = req.cookies.refresh;
  
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token found" });
    }
  
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
  
      const { access_token, refresh_token, expires_in } = response.data;
  
      // Update cookies
      res.cookie("jwt", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: expires_in * 1000,
      });
  
      res.cookie("refresh", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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
