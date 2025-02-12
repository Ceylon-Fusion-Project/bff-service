const express = require("express");
const cartController = require("../../controllers/order-service/cartController");
const authenticateUser = require("../../middlewares/authMiddleware");

module.exports = (keycloak) => {
  const router = express.Router();
  // --- Define Routes ---

  // Route to add item
  router.post("/add-item-to-cart",authenticateUser, cartController.addToCart);

  // Route to remove item
  router.delete("/remove-item-from-cart",authenticateUser, cartController.removeCartItem);

  // Route to get cart details by user id
  router.get("/get-cart-items-by-user-id",authenticateUser, cartController.getCartItemsByUserId);

  return router;
};