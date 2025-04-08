const express = require("express");
const packageController = require("../../controllers/booking-service/packageController");
const authenticateUser = require("../../middlewares/authMiddleware");
const idempotencyMiddleware = require("../../middlewares/idempotencyMiddleware");

module.exports = (keycloak) => {
    const router = express.Router();
    // --- Define Routes ---
  
    // Route to save a product 
    router.post("/save-accommodation",authenticateUser,idempotencyMiddleware, packageController.savePackage);
  
    // Route to get all products with optional sorting
    router.get("/get-all-accommodations", packageController.getAllPackages);

    // Route to get all products without pagination
    router.get("/get-entire-accommodations", packageController.getEntirePackages);
  
    // Route to get product details by ID
    router.get("/get-accommodation-details-by-id", packageController.getPackageById);
  
    // Route to update product details
    router.patch("/update-accommodation-details",authenticateUser,idempotencyMiddleware, packageController.updatePackageDetails);
  
    // Route to delete a product by ID
    router.delete("/delete-accommodation-by-id",authenticateUser,idempotencyMiddleware, packageController.deletePackageByID);
  
    return router;
  };
  