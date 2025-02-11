const express = require("express");
const router = express.Router();

module.exports = (keycloak) => {
  router.get("/login", (req, res) => {
    const redirectUrl = "http://localhost:5173/product-details"; // or wherever
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
router.get("/callback", (req, res) => {
    req.session.authenticated = true;
    // If we get here, keycloak.protect() handled the token exchange, user is logged in
    const redirectUrl = req.session.afterLogin || process.env.FRONTEND_URL;
    delete req.session.afterLogin;

    req.session.save(() => {
        res.redirect(redirectUrl);
      });
  });
  

  // Logout endpoint
  router.get("/logout", (req, res) => {
    const logoutUrl = `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout?redirect_uri=${process.env.FRONTEND_URL}`;
    req.session.destroy();
    res.redirect(logoutUrl);
  });

  //Check authenticated status
  router.get("/check", (req, res) => {
    console.log("Session Data on /check:", req.session); // Debugging
    console.log("Cookies in request:", req.headers.cookie); // Debugging

    if (req.session.authenticated) {
      console.log("User is authenticated in session.");
      return res.status(200).json({ authenticated: true });
    } else {
      console.log("User NOT authenticated in session.");
      return res.status(401).json({ authenticated: false });
    }
  });

  return router;
};
