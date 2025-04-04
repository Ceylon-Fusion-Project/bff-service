const express = require("express");
const cartController = require("../../controllers/order-service/cartController");
const authenticateUser = require("../../middlewares/authMiddleware");
const idempotencyMiddleware = require("../../middlewares/idempotencyMiddleware");

module.exports = (keycloak) => {
  const router = express.Router();
  // --- Define Routes ---

  // Route to add item
  router.post("/add-item-to-cart", authenticateUser, idempotencyMiddleware, cartController.addToCart);
  router.post("/add-item-to-cart-byCard", authenticateUser, cartController.addToCartToggle);

  // Route to remove item
  router.post("/remove-item-from-cart",authenticateUser, cartController.removeCartItem);
  router.post("/remove-item-from-cart-byCard",authenticateUser, cartController.removeCartItemToggle);

  // Route to get cart details by user id
  router.get("/get-cart-items-by-user-id",authenticateUser, cartController.getCartItemsByUserId);

  //Increase cart count
  router.post("/increase-cart-count",authenticateUser, cartController.increaseCartCount);

  //Decrease cart count
  router.post("/decrease-cart-count",authenticateUser, cartController.decreaseCartCount);

  return router;
};