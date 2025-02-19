const express = require("express");
const wishlistController = require("../../controllers/order-service/wishlistController");
const authenticateUser = require("../../middlewares/authMiddleware");

module.exports = (keycloak) => {
  const router = express.Router();
  // --- Define Routes ---

  // Route to add item
  router.post("/add-item-to-wishlist",authenticateUser, wishlistController.addToWishlist);

  // Route to remove item
  router.delete("/remove-item-from-wishlist",authenticateUser, wishlistController.removeFromWishlist);

  // Route to get cart details by user id
  router.get("/get-wishlist-by-user-id",authenticateUser, wishlistController.getWishlist);

  return router;
};