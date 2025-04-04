const axios = require("axios");
const { orderCircuitBreaker, productCircuitBreaker } = require("../../utils/circuitBreaker");

exports.getMergedWishlist = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");

  const userId = req.query.userId;
  if (!userId) throw new Error("Missing userId");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // 1. Fetch raw wishlist items
  const wishlistRes = await orderCircuitBreaker.execute(() =>
    axios.get(`${process.env.API_GATEWAY_URL}/order-service/api/v1/wishlist/get-wishlist/user`, {
      headers,
      params: { userId },
    })
  );

  const wishlistItems = wishlistRes.data || [];

  // 2. Fetch product details
  const enrichedWishlist = await Promise.all(
    wishlistItems.map(async (item) => {
      try {
        const productRes = await productCircuitBreaker.execute(() =>
          axios.get(`${process.env.API_GATEWAY_URL}/product-service/api/v1/product/get-product-details-by-id`, {
            headers,
            params: { id: item.productId },
          })
        );
  
        const product = productRes.data.data;
  
        if (!product || !product.productID) {
          console.warn(`Empty or malformed product data for ID ${item.productId}`);
          return null;
        }
  
        return {
          productId: product.productID, // ✅ Use correct key (not `product.id`)
          name: product.productName,
          price: product.sellingPrice,
          image: product.productImageURLs?.[0] || "",
        };
      } catch (error) {
        console.warn(`❌ Failed to fetch productId ${item.productId}:`, error.message);
        return null;
      }
    })
  );
  
  // 3. Filter nulls
  const validItems = enrichedWishlist.filter(Boolean);

  // 4. Remove duplicates based on productId
  const uniqueWishlist = [];
  const seen = new Set();

  for (const item of validItems) {
    if (!seen.has(item.productId)) {
      seen.add(item.productId);
      uniqueWishlist.push(item);
    }
  }
  if (uniqueWishlist.length === 0) {
    console.warn("No valid wishlist items found after enrichment.");
  }  

  // 5. Return clean list
  return uniqueWishlist;
};
