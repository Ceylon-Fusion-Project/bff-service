const express = require("express");
const eventController = require("../../controllers/booking-service/eventController");
const authenticateUser = require("../../middlewares/authMiddleware");
const idempotencyMiddleware = require("../../middlewares/idempotencyMiddleware");

module.exports = (keycloak) => {
  const router = express.Router();
  // --- Define Routes ---

  // Route to save a product 
  router.post("/save-event",authenticateUser,idempotencyMiddleware, eventController.saveEvent);

  // Route to get all products with optional sorting
  router.get("/get-all-events", eventController.getAllEventWithSort);

  // Route to get all events without pagination
  router.get("/get-entire-events", eventController.getAllEvents);

  // Route to get product details by ID
  router.get("/get-event-details-by-id", eventController.deleteEventByID);

  // Route to get product details by accommodation ID
  router.get("/get-event-details-by-accommodation-id", eventController.getEventByExperienceId);

  // Route to update product details
  router.patch("/update-event-details",authenticateUser,idempotencyMiddleware, eventController.updateEventDetails);

  // Route to delete a product by ID
  router.delete("/delete-event-by-id",authenticateUser,idempotencyMiddleware, eventController.deleteEventByID);

  // Route to get products by applying filters
  router.get("/get-event-by-filtering", eventController.getEventByFiltering);

  return router;
};
