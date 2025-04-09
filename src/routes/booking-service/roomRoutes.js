const express = require("express");
const roomController = require("../../controllers/booking-service/roomController");
const authenticateUser = require("../../middlewares/authMiddleware");
const idempotencyMiddleware = require("../../middlewares/idempotencyMiddleware");

module.exports = (keycloak) => {
  const router = express.Router();
  // --- Define Routes ---

  // Route to save a product 
  router.post("/save-room",authenticateUser,idempotencyMiddleware, roomController.saveRoom);

  // Route to get all products with optional sorting
  router.get("/get-all-rooms", roomController.getAllRoomsWithSort);

  // Route to get all rooms without pagination
  router.get("/get-entire-rooms", roomController.getAllRooms);

  // Route to get product details by ID
  router.get("/get-room-details-by-id", roomController.deleteRoomByID);

  // Route to get product details by accommodation ID
  router.get("/get-room-details-by-accommodation-id", roomController.getRoomByAccommodationId);

  // Route to update product details
  router.patch("/update-room-details",authenticateUser,idempotencyMiddleware, roomController.updateRoomDetails);

  // Route to delete a product by ID
  router.delete("/delete-room-by-id",authenticateUser,idempotencyMiddleware, roomController.deleteRoomByID);

  // Route to get products by applying filters
  router.get("/get-room-by-filtering", roomController.getRoomByFiltering);

  return router;
};
