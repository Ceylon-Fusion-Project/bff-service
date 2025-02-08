const express = require("express");
const productController = require("../../controllers/product-service/productController");

module.exports = (keycloak) => {
  const router = express.Router();

  // --- Define Routes ---

  // Route to save a product
  // Protects the route using Keycloak to ensure only authenticated users can access it
  router.post(
    "/save-product",
    keycloak.protect(),
    productController.saveProduct
  );

  // Route to get all products with optional sorting
  // This route is public and does not require authentication
  router.get("/get-products", productController.getAllProductsWithSort);

  const sampleProduct = {
    productID: 1,
    productCode: "C-001",
    productName: "Example",
    productDescription: "Sample product",
    sellingPrice: 200,
    productQuantity: 50
  };

  // Route to get product details by ID
  router.get("/get-product-details-by-id",productController.getProductById);

  // Route to update product details
  router.patch(
    "/update-product-details",
    keycloak.protect(),
    productController.updateProductDetails
  );

  // Route to delete a product by ID
  router.delete(
    "/delete-product-by-id",
    keycloak.protect(),
    productController.deleteProductByID
  );

  // Route to get products by applying filters
  router.get(
    "/get-product-by-filtering",
    productController.getProductByFiltering
  );

  return router;
};
