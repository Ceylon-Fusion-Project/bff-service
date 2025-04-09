const userService = require("../../services/user-service/userService");

exports.completeRegistration = async (req, res) => {
  try {
    const data = await userService.completeRegistration(req,res); // Calls the service
    // Responds with HTTP 201 (Created) if successful
    res.status(201).json({
      message: "Registration Completed successfully",
      data: data, // received data from the service
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.getUserByCFId = async (req, res) => {
  try {
    const data = await userService.getUserByCFId(req);
    res.status(200).json({
      message: "User Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.updateProductDetails = async (req, res) => {
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
