const cartService = require("../../services/order-service/cartService");

exports.addToCart = async (req, res) => {
  try {
    const data = await cartService.addToCart(req);
    res.status(200).json({
      message: "Add Item to Cart Successfully",
      data: data,
    });
  } catch (error) {
    res.status(405).json({ message: error.message });
  }
};

exports.addToCartToggle = async (req, res) => {
  try {
    const data = await cartService.addToCartToggle(req);
    res.status(200).json({
      message: "Add Item to Cart Successfully",
      data: data,
    });
  } catch (error) {
    res.status(405).json({ message: error.message });
  }
};

exports.removeCartItem= async (req, res) => {
    try {
      const data = await cartService.removeCartItem(req);
      res.status(200).json({
        message: "Remove Item from Cart Successfully",
        data: data,
      });
    } catch (error) {
      res.status(405).json({ message: error.message });
    }
  };

  exports.removeCartItemToggle= async (req, res) => {
    try {
      const data = await cartService.removeCartItemToggle(req);
      res.status(200).json({
        message: "Remove Item from Cart Successfully",
        data: data,
      });
    } catch (error) {
      res.status(405).json({ message: error.message });
    }
  };

  exports.getCartItemsByUserId= async (req, res) => {
    try {
      const data = await cartService.getCartItemsByUserId(req);
      res.status(200).json({
        message: "Cart Details Fetched Successfully",
        data: data,
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  exports.increaseCartCount= async (req, res) => {
    try {
      const data = await cartService.increaseCartCount(req);
      res.status(200).json({
        message: "Increase Cart Count Successfully",
        data: data,
      });
    } catch (error) {
      res.status(405).json({ message: error.message });
    }
  };

  exports.decreaseCartCount= async (req, res) => {
    try {
      const data = await cartService.decreaseCartCount(req);
      res.status(200).json({
        message: "Decrease Cart Count Successfully",
        data: data,
      });
    } catch (error) {
      res.status(405).json({ message: error.message });
    }
  };

  