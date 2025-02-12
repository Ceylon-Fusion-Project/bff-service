const express = require("express");
const idempotencyMiddleware = require("../middlewares/idempotencyMiddleware");
const { redisCircuitBreaker } = require("../utils/circuitBreaker");

module.exports = (keycloak) => {
  const router = express.Router();

  // Import route handlers: PRODUCT_SERVICE
  const productRoutes = require("./product-service/productRoutes")(keycloak);
  const authRoutes = require("./authRoutes")(keycloak);
  const ratingRoutes = require("./product-service/ratingRoutes")(keycloak);
  const originRoutes = require("./product-service/originRoutes")(keycloak);
  const certificationRoutes = require("./product-service/certificationRoutes")(keycloak);

  // --- Route Aggregation ---

//Register routes: PRODUCT_SERVICES
  router.use("/api/v1/product", productRoutes);
  router.use("/api/v1/auth", authRoutes);
  router.use("/api/v1/certifications", certificationRoutes);
  router.use("/api/v1/ratings", ratingRoutes);
  router.use("/api/v1/origins", originRoutes);
  

  router.get("/health", async (req, res) => {
    try {
      const redisStatus = await redisCircuitBreaker.execute(() =>
        redisClient.ping()
      );
      res
        .status(200)
        .json({ message: "Service is healthy", redis: redisStatus });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Service is unhealthy", error: error.message });
    }
  });

  router.use((err, req, res, next) => {
    console.error("Route Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  });

  return router;
};
