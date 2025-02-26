const express = require("express");
const orderController = require("../../controllers/order-service/orderController");
const authenticateUser = require("../../middlewares/authMiddleware");
const idempotencyMiddleware = require("../../middlewares/idempotencyMiddleware");

module.exports = (keycloak) => {
  const router = express.Router();
  // --- Define Routes ---

  // Route to place order from cart
  router.post("/place-order-from-cart",authenticateUser,idempotencyMiddleware, orderController.placeOrderFromCart);

  // Route to get all orders
  router.get("/get-all-orders", orderController.getAllOrders);

  // Route to get order details by user id
  router.get("/get-orders-by-user-id",authenticateUser, orderController.getOrdersByUserId);

  // Route to cancel order
  router.patch("/cancel-order",authenticateUser,idempotencyMiddleware, orderController.cancelOrderByOrderId);

  // Route to place direct order
  router.post("/place-direct-order",authenticateUser,idempotencyMiddleware, orderController.placeDirectOrder);

  return router;
};