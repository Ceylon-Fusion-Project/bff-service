const wishlistService = require("../../services/order-service/wishlistService");

exports.addToWishlist = async (req, res) => {
  try {
    const data = await wishlistService.addToWishlist(req);
    res.status(200).json({
      message: "Add Item to Wishlist Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const data = await wishlistService.removeFromWishlist(req);
    res.status(200).json({
      message: "Remove Item from Wishlist Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const data = await wishlistService.getWishlist(req);
    res.status(200).json({
      message: "Cart Details Fetched Successfully",
      data: data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
