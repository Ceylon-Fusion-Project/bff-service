const express = require("express");
const router = express.Router();

module.exports = (keycloak) => {
  // Login endpoint
  //   router.get("/login", (req, res) => {
  //     // Store the originally requested URL in session
  //     // if (!req.session.originalUrl) {
  //     //   req.session.originalUrl =
  //     //     req.query.redirect || process.env.FRONTEND_URL || "/";
  //     // }
  //     //res.redirect("/api/v1/auth/callback");

  //     ///////////////////////////////////////////////////
  //     // Store the originally requested URL in session
  //     // Store the originally requested URL from the query string if provided,
  //     // otherwise fallback to the default frontend URL.
  //     if (req.query.redirect) {
  //         req.session.originalUrl = req.query.redirect;
  //       } else {
  //         req.session.originalUrl = process.env.FRONTEND_URL || "/";
  //       }
  //       // Save the session and then redirect to Keycloak's login URL.
  //       req.session.save((err) => {
  //         if (err) {
  //           console.error("❌ Error saving session:", err);
  //           return res.status(500).json({ error: "Session not saved" });
  //         }
  //         console.log("✅ Saved original URL:", req.session.originalUrl);

  //         // Construct the Keycloak login URL.
  //         const loginUrl = `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth` +
  //           `?client_id=${process.env.KEYCLOAK_CLIENT_ID}` +
  //           `&response_type=code` +
  //           `&redirect_uri=${encodeURIComponent(process.env.BFF_URL + "/api/v1/auth/callback")}` +
  //           `&scope=openid`;

  //         res.redirect(loginUrl);
  //       });
  //   });

  // Unprotected Login endpoint
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

  // Callback handler
//   router.get("/callback", (req, res) => {
//     console.log("User authenticated, setting session."); // Debugging

//     // Prevent infinite redirects
//     if (req.session.authenticated) {
//       console.log("Session already authenticated, redirecting to frontend...");
//       return res.redirect(process.env.FRONTEND_URL || "/");
//     }

//     // Explicitly save the session before redirecting
//     req.session.authenticated = true;
//     req.session.save((err) => {
//       if (err) {
//         console.error("Error saving session:", err);
//         return res.status(500).json({ error: "Session not saved" });
//       }

//       console.log("Session successfully saved with authentication flag.");
//       console.log("Session after setting authenticated:", req.session);

//       const redirectUrl =
//         req.session.originalUrl || process.env.FRONTEND_URL || "/";
//       delete req.session.originalUrl;

//       console.log("Redirecting to:", redirectUrl); // Debugging
//       res.redirect(redirectUrl);
//     });
//   });

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
