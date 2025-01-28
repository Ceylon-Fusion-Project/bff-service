const express = require("express");

module.exports = (keycloak) => {
  const router = express.Router();

  // Import route handlers
  const productRoutes = require("./product-service/productRoutes")(keycloak);
  const authRoutes = require('./authRoutes')(keycloak);
//   const ratingRoutes = require("./product-service/ratingRoutes")(keycloak);
//   const originRoutes = require("./product-service/originRoutes")(keycloak);
//   const certificationRoutes = require("./product-service/certificationRoutes")(keycloak);

  // --- Route Aggregation ---

  //Register routes
  router.use("/api/v1/product", productRoutes);
  router.use('/auth', authRoutes);
//   router.use("/api/ratings", ratingRoutes);
//   router.use("/api/origins", originRoutes);
//   router.use("/api/certifications", certificationRoutes);

  return router;
};
