const express = require("express");
const productController = require("../../controllers/product-service/productController");
const authenticateUser = require("../../middlewares/authMiddleware");

module.exports = (keycloak) => {
  const router = express.Router();
  // --- Define Routes ---

  // Route to save a product
  router.post("/save-product",authenticateUser, productController.saveProduct);

  // Route to get all products with optional sorting
  router.get("/get-all-products", productController.getAllProductsWithSort);

  // Route to get product details by ID
  router.get("/get-product-details-by-id",authenticateUser, productController.getProductById);

  // Route to update product details
  router.patch("/update-product-details",authenticateUser, productController.updateProductDetails);

  // Route to delete a product by ID
  router.delete("/delete-product-by-id",authenticateUser, productController.deleteProductByID);

  // Route to get products by applying filters
  router.get("/get-product-by-filtering", productController.getProductByFiltering);

  return router;
};
