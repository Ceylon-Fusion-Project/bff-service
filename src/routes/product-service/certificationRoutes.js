const express = require("express");
const certController = require("../../controllers/product-service/certificationController");
const authenticateUser = require("../../middlewares/authMiddleware");

module.exports = (keycloak) => {
    const router = express.Router();
    // --- Define Routes ---
  
    // Route to save a certificate
    router.post("/save-certificate",authenticateUser, certController.saveCertificate);
  
    // Route to get certificate details by product ID
    router.get("/get-certificate-by-product-id", certController.getCertificateById);
  
    // Route to update certificate details
    router.patch("/update-certificate-details",authenticateUser, certController.updateCertificateDetails);
  
    // Route to delete a certificate by ID
    router.delete("/delete-certificate-by-id",authenticateUser, certController.deleteCertificateByID);
  
    return router;
  };