const axios = require("axios");

exports.addToCart = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/order-service/api/v1/cart/add-item-to-cart`;

  const response = await axios.post(url, req.body, {
    headers: { Authorization: `Bearer ${token}` },
  });  
  return response.data;
};

exports.addToCartToggle = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/order-service/api/v1/cart/add-item-to-cart`;

  const response = await axios.post(url, req.body, {
    headers: { Authorization: `Bearer ${token}` },
  });  
  return response.data;
};

exports.removeCartItem = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/order-service/api/v1/cart/remove-item-from-cart`;

  const response = await axios.post(url,req.body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

exports.removeCartItemToggle = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/order-service/api/v1/cart/remove-item-from-cart`;

  const response = await axios.post(url,req.body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

exports.getCartItemsByUserId = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { userId } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/order-service/api/v1/orders/get-cart-items/`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      userId,
    },
  });
};
