const express = require("express");
const wishlistController = require("../../controllers/aggregated-service/aggregateWishlistController");
const authenticateUser = require("../../middlewares/authMiddleware");

module.exports = (keycloak) => {
  const router = express.Router();

  router.get("/merged-wishlist", authenticateUser, wishlistController.getMergedWishlist);

  return router;
};
