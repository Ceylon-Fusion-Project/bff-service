const express = require("express");
const experienceController = require("../../controllers/booking-service/experienceController");
const authenticateUser = require("../../middlewares/authMiddleware");
const idempotencyMiddleware = require("../../middlewares/idempotencyMiddleware");

module.exports = (keycloak) => {
    const router = express.Router();
    // --- Define Routes ---
  
    // Route to save a product 
    router.post("/save-experience",authenticateUser, experienceController.saveExperience);
  
    // Route to get all products with optional sorting
    router.get("/get-all-experiences", experienceController.getAllExperience);

    // Route to get all products without pagination
    router.get("/get-entire-experiences", experienceController.getEntireExperience);
  
    // Route to get product details by ID
    router.get("/get-experience-details-by-id", experienceController.getExperienceById);
  
    // Route to update product details
    router.patch("/update-experience-details",authenticateUser,idempotencyMiddleware, experienceController.updateExperienceDetails);
  
    // Route to delete a product by ID
    router.delete("/delete-experience-by-id",authenticateUser,idempotencyMiddleware, experienceController.deleteExperienceByID);
  
    // Route to get products by applying filters
    router.get("/get-experience-by-filtering", experienceController.getExperienceByFiltering);
  
    return router;
  };
  