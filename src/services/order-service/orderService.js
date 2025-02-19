const axios = require("axios");

exports.getOrdersByUserId = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { userId } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/order-service/api/v1/orders/get-orders-by-user-id`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { userId },
  });
  return response.data;
};

exports.getAllOrders = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { orderStatus, page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/order-service/api/v1/orders/get-all-orders`;
  //const url = `http://localhost:8080/api/v1/product/get-all-products`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      orderStatus,
      page,
      size,
    },
  });
};

exports.placeOrderFromCart = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { userId } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/order-service/api/v1/orders/place-order-from-cart`;
  //const url = `http://localhost:8080/api/v1/product/get-all-products`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      userId,
    },
  });
};

exports.placeDirectOrder = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/order-service/api/v1/orders/place-direct-order`;

  const response = await axios.post(url, req.body, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach token for authorization
    },
  });

  return response.data; // Return backend response to the front-end
};

exports.cancelOrderByOrderId = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { orderId } = req.query;
  const url = `${process.env.PRODUCT_MS_URL}/product-service/api/v1/product/cancel-order-by-order-id`;

  const response = await axios.patch(url, req.body, {
    headers: { Authorization: `Bearer ${token}` },
    params: { orderId },
  });

  return response.data;
};

// exports.confirmOrderByOrderId = async (req) => {
//     const token = req.cookies.jwt;
//     if (!token) throw new Error("Unauthorized");
//     const { orderId } = req.query;
//     const url = `${process.env.PRODUCT_MS_URL}/product-service/api/v1/product/confirm-order-by-order-id`;
  
//     const response = await axios.patch(url, req.body, {
//       headers: { Authorization: `Bearer ${token}` },
//       params: { orderId },
//     });
//     return response.data;
//   };
