const express = require("express");
const originController = require("../../controllers/product-service/originController");
const authenticateUser = require("../../middlewares/authMiddleware");

module.exports = (keycloak) => {
    const router = express.Router();
    // --- Define Routes ---
  
    // Route to save a origin
    router.post("/save-origin",authenticateUser, originController.saveOrigin);

    //Route to get all origins with optional pagination
    router.get("/get-all-origins", originController.getAllOrigins);
  
    // Route to get origin details by product ID
    router.get("/get-origin-by-id", originController.getOriginById);
  
    // Route to update origin details
    router.patch("/update-origin",authenticateUser, originController.updateOriginDetails);
  
    // Route to delete a origin by ID
    router.delete("/delete-origin-by-id",authenticateUser, originController.deleteOriginByID);
  
    return router;
  };