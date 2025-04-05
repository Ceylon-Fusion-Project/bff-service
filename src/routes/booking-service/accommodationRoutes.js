const express = require("express");
const accommodationController = require("../../controllers/booking-service/accommodationController");
const authenticateUser = require("../../middlewares/authMiddleware");
const idempotencyMiddleware = require("../../middlewares/idempotencyMiddleware");

module.exports = (keycloak) => {
    const router = express.Router();
    // --- Define Routes ---
  
    // Route to save a product 
    router.post("/save-accommodation",authenticateUser,idempotencyMiddleware, accommodationController.saveAccommodation);
  
    // Route to get all products with optional sorting
    router.get("/get-all-accommodations", accommodationController.getAllAccommodation);
  
    // Route to get product details by ID
    router.get("/get-accommodation-details-by-id", accommodationController.deleteAccommodationByID);
  
    // Route to update product details
    router.patch("/update-accommodation-details",authenticateUser,idempotencyMiddleware, accommodationController.updateAccommodationDetails);
  
    // Route to delete a product by ID
    router.delete("/delete-accommodation-by-id",authenticateUser,idempotencyMiddleware, accommodationController.deleteAccommodationByID);
  
    // Route to get products by applying filters
    router.get("/get-accommodation-by-filtering", accommodationController.getAccommodationByFiltering);
  
    return router;
  };
  