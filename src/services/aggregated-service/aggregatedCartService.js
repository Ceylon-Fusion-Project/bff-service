const axios = require("axios");
const axiosInstance = require("../../utils/axiosInstance");
const { orderCircuitBreaker, productCircuitBreaker } = require("../../utils/circuitBreaker");

exports.getMergedCart = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");

  const userId = req.query.userId;
  if (!userId) throw new Error("Missing userId in request");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Fetch cart items from OrderMS
  const cartRes = await orderCircuitBreaker.execute(() =>
    axios.get(`${process.env.API_GATEWAY_URL}/order-service/api/v1/cart/get-cart-items/user`, {
      headers,
      params: { userId },
    })
  );

  const cartItems = cartRes.data.data?.cartItems || [];

  // Use Promise.all to fetch each product details concurrently
  const enrichedCart = await Promise.all(
    cartItems.map(async (item) => {
      try {
        const productRes = await productCircuitBreaker.execute(() =>
          axios.get(`${process.env.API_GATEWAY_URL}/product-service/api/v1/product/get-product-details-by-id`, {
            headers,
            params: { id: item.productId },
          })
        );

        const product = productRes.data.data || {};

        return {
            id: item.cartItemId,
            productId: item.productId,
            name: product.productName,
            image: product.productImageURLs?.[0] || "",
            price: product.sellingPrice,
            quantity: item.cartItemQuantity,
        };
      } catch (error) {
        console.warn(`Product ${item.productId} not found.`);
        return {
          id: item.cartItemId,
          productId: item.productId,
          name: "Unknown Product",
          image: "",
          price: item.cartItemPrice,
          quantity: item.cartItemQuantity,
        };
      }
    })
  );
  return enrichedCart;
};
