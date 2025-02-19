const axios = require("axios");

exports.saveRating = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product-rating/save-product-rating`;

  const response = await axios.post(url, req.body, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach token for authorization
    },
  });

  return response.data; // Return backend response to the front-end
};

exports.getRatingsByProductId = async (req) => {
  const { productID, sort, page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product-rating/get-product-ratings-by-product-id`;

  const response = await axios.get(url, {
    params: {
      productID,
      sort,
      page,
      size,
    },
  });
  return response.data;
};

exports.getRatingsByUserId = async (req) => {
    const { customerID, sort, page, size } = req.query;
    const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product-rating/get-product-ratings-by-user-id`;
  
    const response = await axios.get(url, {
      params: {
        customerID,
        sort,
        page,
        size,
      },
    });
    return response.data;
  };

exports.updateRatingDetails = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { productRatingID } = req.query;
  const url = `${process.env.PRODUCT_MS_URL}/product-service/api/v1/product-rating/update-product-rating`;

  const response = await axios.patch(url, req.body, {
    headers: { Authorization: `Bearer ${token}` },
    params: { productRatingID },
  });

  return response.data;
};

exports.deleteRatingByID = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { productRatingID } = req.query;
  const url = `${process.env.PRODUCT_MS_URL}/product-service/api/v1/product-rating/delete-product-rating-by-id`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { productRatingID },
  });

  return response.data;
};
