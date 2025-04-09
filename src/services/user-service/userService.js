const axios = require("axios");
const jwt = require("jsonwebtoken");

// exports.completeRegistration = async (req) => {
//   //const token = req.kauth.grant.access_token.token;// Extract authentication token from req
//   const token = req.cookies.jwt;
//   if (!token) throw new Error("Unauthorized");

//   // Decode token to extract Keycloak user ID and roles
//   const decoded = jwt.decode(token);
//   const cfId = decoded?.sub;
//   const roles = decoded?.realm_access?.roles || [];

//   if (!cfId) throw new Error("Invalid token: missing user ID");

//   // Pick first available role
//   const role = roles.length > 0 ? roles[0].toUpperCase() : "BUYER";

//   // Merge additional fields into the payload
//   const payload = {
//     ...req.body,
//     cfId,
//     role,
//     currency: req.body.currency || "USD",
//   };

//   const url = `${process.env.API_GATEWAY_URL}/identity-service/api/v1/users/register`;

//   const response = await axios.post(url, req.body, {
//     headers: {
//       Authorization: `Bearer ${token}`, // Attach token for authorization
//     },
//   });

// //   // Get redirect URL from session and send it to frontend
// //   const redirectTo = req.session.afterLogin || process.env.FRONTEND_URL;
// //   delete req.session.afterLogin;
// //   req.session.save(() => {
// //     res.status(200).json({ message: "Registration complete", redirectTo });
// //   });

//   return response.data; // Return backend response to the front-end
// };

// exports.completeRegistration = async (req, res) => {
//     try {
//       const token = req.cookies.jwt;
//       if (!token) throw new Error("Unauthorized");
  
//       const decoded = jwt.decode(token);
//       const keycloakId = decoded?.sub;
//       const role = "BUYER";
  
//       //const url = `${process.env.API_GATEWAY_URL}/identity-service/api/v1/users/register`;
//         const url = "http://localhost:8082/api/v1/users/register";
  
//       const payload = {
//         ...req.body,
//         cfId: keycloakId,
//         role,
//         currency: "USD", // Default currency
//       };

//       console.log(payload);
  
//       const response = await axios.post(url, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
  
//       // Get redirect URL from session and send it to frontend
//       const redirectTo = req.session.afterLogin || process.env.FRONTEND_URL;
//       delete req.session.afterLogin;
//       req.session.save(() => {
//         res.status(200).json({ message: "Registration complete", redirectTo });
//       });
  
//     } catch (error) {
//       console.error("Error during registration:", error.response?.data || error.message);
//       res.status(500).json({ error: "Registration failed" });
//     }
//   };
  
exports.completeRegistration = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.decode(token);
    const keycloakId = decoded?.sub;
    const role = "BUYER";

    const payload = {
      ...req.body,
      cfId: keycloakId,
      role,
      currency: "USD",
    };

    console.log(payload);

    const url = `${process.env.API_GATEWAY_URL}/identity-service/api/v1/users/register`;
    //const url = "http://localhost:8082/api/v1/users/register";
    const redirectTo = req.session.afterLogin || "/";

    try {
      const response = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      delete req.session.afterLogin;

      req.session.save((err) => {
        if (err) {
          console.warn("⚠️ Session save failed after DB success:", err.message);
          // Still safe to return success here
        }

        if (!res.headersSent) {
          return res.status(200).json({
            message: "Registration complete",
            redirectTo,
          });
        }
      });
    } catch (dbError) {
      console.error("❌ DB is down. Storing in Redis...", dbError.message);

      // TODO: Save to Redis logic here (if not already handled by idempotencyMiddleware)

      delete req.session.afterLogin;

      req.session.save((err) => {
        if (err) {
          console.warn("⚠️ Session save failed after Redis fallback:", err.message);
          if (!res.headersSent) {
            return res.status(202).json({
              message: "Stored in Redis, session not saved",
              redirectTo,
            });
          }
        } else if (!res.headersSent) {
          return res.status(202).json({
            message: "Stored in Redis, will sync later",
            redirectTo,
          });
        }
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Registration failed" });
    }
  }
};

exports.getUserByCFId = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.decode(token);
  const cfId = decoded?.sub;

  if (!cfId) throw new Error("Invalid token. Missing subject (sub)");

  const url = `${process.env.API_GATEWAY_URL}/identity-service/api/v1/users/get-by-cfid`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { cfId },
  });

  return response.data.data; // Extract the actual user object
};