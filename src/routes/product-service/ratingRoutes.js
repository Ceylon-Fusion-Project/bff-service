const express = require("express");
const ratingController = require("../../controllers/product-service/ratingController");
const authenticateUser = require("../../middlewares/authMiddleware");

module.exports = (keycloak) => {
    const router = express.Router();
    // --- Define Routes ---
  
    // Route to save a rating
    router.post("/save-rating",authenticateUser, ratingController.saveRate);
  
    // Route to get rating details by product ID
    router.get("/get-ratings-by-product-id", ratingController.getRatingsByProductId);

    // Route to get rating details by product ID
    router.get("/get-ratings-by-user-id", ratingController.getRatingsByUserId);
  
    // Route to update rating details
    router.patch("/update-rating-details",authenticateUser, ratingController.updateRatingDetails);
  
    // Route to delete a rating by ID
    router.delete("/delete-rating-by-id",authenticateUser, ratingController.deleteRatingsByID);
  
    return router;
  };