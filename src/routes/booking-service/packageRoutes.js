const express = require("express");
const packageController = require("../../controllers/booking-service/packageController");
const authenticateUser = require("../../middlewares/authMiddleware");
const idempotencyMiddleware = require("../../middlewares/idempotencyMiddleware");

module.exports = (keycloak) => {
    const router = express.Router();
    // --- Define Routes ---
  
    // Route to save a product 
    router.post("/save-package",authenticateUser, packageController.savePackage);
  
    // Route to get all products with optional sorting
    router.get("/get-all-package", packageController.getAllPackages);

    // Route to get all products without pagination
    router.get("/get-entire-package", packageController.getEntirePackages);
  
    // Route to get product details by ID
    router.get("/get-package-details-by-id", packageController.getPackageById);
  
    // Route to update product details
    router.patch("/update-package-details",authenticateUser,idempotencyMiddleware, packageController.updatePackageDetails);
  
    // Route to delete a product by ID
    router.delete("/delete-package-by-id",authenticateUser, packageController.deletePackageByID);
  
    return router;
  };
  