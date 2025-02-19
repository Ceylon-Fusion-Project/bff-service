const axios = require("axios");

exports.addToWishlist = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/order-service/api/v1/wishlist/add-item-to-wishlist`;

  const response = await axios.post(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

exports.removeFromWishlist = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.PRODUCT_MS_URL}/order-service/api/v1/wishlist/remove-item-from-wishlist`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

exports.getWishlist = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { userId } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/order-service/api/v1/wishlist/get-wishlist-by-user-id`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      userId,
    },
  });
};
