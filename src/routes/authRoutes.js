const express = require('express');
const router = express.Router();

module.exports = (keycloak) => {
  // Login endpoint
  router.get('/login', keycloak.protect(), (req, res) => res.redirect('/'));

  // Registration endpoint
  router.get('/register', (req, res) => {
    const registerUrl = `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/registrations?client_id=${process.env.KEYCLOAK_CLIENT_ID}&response_type=code&redirect_uri=${process.env.BFF_URL}/auth/callback`;
    res.redirect(registerUrl);
  });

  // Callback handler
  router.get('/auth/callback', keycloak.protect(), (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
  });

  // Logout endpoint
  router.get('/logout', (req, res) => {
    const logoutUrl = `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout?redirect_uri=${process.env.FRONTEND_URL}`;
    req.session.destroy();
    res.redirect(logoutUrl);
  });

  return router;
};