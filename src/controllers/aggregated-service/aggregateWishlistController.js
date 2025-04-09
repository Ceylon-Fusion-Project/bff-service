const aggregatedWishlistService = require("../../services/aggregated-service/aggregatedWishlistService");

exports.getMergedWishlist = async (req, res) => {
  try {
    const mergedWishlist = await aggregatedWishlistService.getMergedWishlist(req);
    res.status(200).json({ wishlist: mergedWishlist });
  } catch (error) {
    console.error("Wishlist Aggregation Error:", error.message);
    res.status(502).json({ error: "Failed to fetch wishlist." });
  }
};
