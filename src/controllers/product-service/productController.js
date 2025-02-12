const productService = require("../../services/product-service/productService");

exports.saveProduct = async (req, res) => {
  // If the session is not authenticated, return a JSON error.
  // if (!req.session.authenticated) {
  //   return res.status(401).json({
  //     message: "Not authenticated. Please log in.",
  //     loginEndpoint: "/api/v1/auth/login", // provide a login endpoint for the client to call
  //   });
  //}
  try {
    const data = await productService.saveProduct(req); // Calls the service
    // Responds with HTTP 201 (Created) if successful
    res.status(201).json({
      message: "Product saved successfully",
      data: data, // received data from the service
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updateProductDetails = async (req, res) => {
  // If the session is not authenticated, return a JSON error.
  // if (!req.session.authenticated) {
  //   return res.status(401).json({
  //     message: "Not authenticated. Please log in.",
  //     loginEndpoint: "/api/v1/auth/login", // provide a login endpoint for the client to call
  //   });
  // }
  try {
    const data = await productService.updateProductDetails(req);
    res.status(200).json({
      message: "Product Updated Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteProductByID = async (req, res) => {
  // If the session is not authenticated, return a JSON error.
  // if (!req.session.authenticated) {
  //   return res.status(401).json({
  //     message: "Not authenticated. Please log in.",
  //     loginEndpoint: "/api/v1/auth/login", // provide a login endpoint for the client to call
  //   });
  // }
  try {
    const data = await productService.deleteProductByID(req);
    res.status(200).json({
      message: "Product Deleted Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  // If the session is not authenticated, return a JSON error.
  // if (!req.session.authenticated) {
  //   return res.status(401).json({
  //     message: "Not authenticated. Please log in.",
  //     loginEndpoint: "/api/v1/auth/login", // provide a login endpoint for the client to call
  //   });
  // }
  try {
    const data = await productService.getProductById(req);
    res.status(200).json({
      message: "Product Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getProductByFiltering = async (req, res) => {
  try {
    const data = await productService.getProductByFiltering(req);
    res.status(200).json({
      message: "Product Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAllProductsWithSort = async (req, res) => {
  try {
    const data = await productService.getAllProductsWithSort(req);
    res.status(200).json({
      message: "All Products",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
