const express = require("express");
const { redisCircuitBreaker } = require("../utils/circuitBreaker");
const { redisClient } = require("../config/redis");

module.exports = (keycloak) => {
  const router = express.Router();

  // Import route handlers: AUTHENTICATION
  const authRoutes = require("./authRoutes")(keycloak);

  // Import route handlers: PRODUCT_SERVICE
  const productRoutes = require("./product-service/productRoutes")(keycloak);
  const ratingRoutes = require("./product-service/ratingRoutes")(keycloak);
  const originRoutes = require("./product-service/originRoutes")(keycloak);
  const certificationRoutes = require("./product-service/certificationRoutes")(keycloak);

  // Import route handlers: ORDER_SERVICE
  const orderRoutes = require("./order-service/orderRoutes")(keycloak);
  const cartRoutes = require("./order-service/cartRoutes")(keycloak);
  const wishlistRoutes = require("./order-service/wishlistRoutes")(keycloak);

  // Import route handlers: BOOKING_SERVICE
  const accommodationRoutes = require("./booking-service/accommodationRoutes")(keycloak);
  const roomRoutes = require("./booking-service/roomRoutes")(keycloak);
  const experienceRoutes = require("./booking-service/experienceRoutes")(keycloak);
  const eventRoutes = require("./booking-service/eventRoutes")(keycloak);
  const packageRoutes = require("./booking-service/packageRoutes")(keycloak);

  // Import route handlers: UPLOAD_SERVICE
  const uploadService = require("./upload-service/uploadRoutes")(keycloak);

  // Import Aggregate Routes
  const aggregatedCartRoute = require("./aggregated-service/aggregatedCartRoute")(keycloak);
  const aggregatedWishlistRoute = require("./aggregated-service/aggregateWishlistRoute")(keycloak);

  // Import route handlers: USER_SERVICE
     const userRoutes = require("./user-service/userRoutes")(keycloak);

  //____________________________________________________________________________________
  //
  //  --- Route Aggregation ---
  //____________________________________________________________________________________

  //Register routes: AUTHENTICATION
  router.use("/api/v1/auth", authRoutes);

  //Register routes: PRODUCT_SERVICES
  router.use("/api/v1/product", productRoutes);
  router.use("/api/v1/certifications", certificationRoutes);
  router.use("/api/v1/ratings", ratingRoutes);
  router.use("/api/v1/origin", originRoutes);

  //Register routes: UPLOAD_SERVICES
  router.use("/api/v1/upload", uploadService);

  //Register routes: ORDER_SERVICES
  router.use("/api/v1/orders", orderRoutes);
  router.use("/api/v1/cart", cartRoutes);
  router.use("/api/v1/wishlist", wishlistRoutes);

  //Register routes: BOOKING_SERVICES
  router.use("/api/v1/accommodation", accommodationRoutes);
  router.use("/api/v1/rooms", roomRoutes);
  router.use("/api/v1/experience", experienceRoutes);
  router.use("/api/v1/events", eventRoutes);
  router.use("/api/v1/packages", eventRoutes);

  // Aggregated Route for Cart (requires data from OrderMS + ProductMS)
  router.use("/api/v1/aggregated-cart", aggregatedCartRoute);

  // Aggregated Route for Wishlist (requires data from OrderMS + ProductMS)
  router.use("/api/v1/aggregated-wishlist", aggregatedWishlistRoute);

  //Register routes: USER_SERVICES
  router.use("/api/v1/user", userRoutes);

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
