const express = require("express");
const aggregatedCartController = require("../../controllers/aggregated-service/aggregatedCartController");
const authenticateUser = require("../../middlewares/authMiddleware");
//const idempotencyMiddleware = require("../../middlewares/idempotencyMiddleware");

module.exports = (keycloak) => {
  const router = express.Router();
  
  // Authenticated route
  router.get("/merged-cart-details", authenticateUser, aggregatedCartController.getMergedCart);
  return router;
};
