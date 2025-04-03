const aggregatedCartService = require("../../services/aggregated-service/aggregatedCartService");

exports.getMergedCart = async (req, res) => {
  try {
    const cartData = await aggregatedCartService.getMergedCart(req);
    res.status(200).json({ cart: cartData });
  } catch (error) {
    console.error(`[${req.requestId}] AggregatedCart Error:`, error.message);
    res.status(502).json({ error: "Failed to fetch cart data." });
  }
};
