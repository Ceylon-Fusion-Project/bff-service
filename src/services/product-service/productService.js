const axios = require("axios");

exports.saveProduct = async (req) => {
  //const token = req.kauth.grant.access_token.token;// Extract authentication token from req
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product/save-product`;

  const response = await axios.post(url, req.body, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach token for authorization
    },
  });

  return response.data; // Return backend response to the front-end
};

exports.getAllProductsWithSort = async (req) => {
  const { status, sort, page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product/get-all-products`;
  //const url = `http://localhost:8080/api/v1/product/get-all-products`;
  const response = await axios.get(url, {
    params: {
      status,
      sort,
      page,
      size,
    },
  });

  return response.data;
};

exports.getProductById = async (req) => {
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product/get-product-details-by-id`;

  const response = await axios.get(url, {
    params: { id },
  });
  return response.data;
};

exports.updateProductDetails = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product/update-product-details`;

  const response = await axios.patch(url, req.body, {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });

  return response.data;
};

exports.deleteProductByID = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { id } = req.query;
  const url = `${process.env.PRODUCT_MS_URL}/product-service/api/v1/product/delete-product-by-id`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });

  return response.data;
};

exports.getProductByFiltering = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const {
    productName,
    minPrice,
    maxPrice,
    averageRating,
    startDate,
    endDate,
    activeStatus,
    sort,
    page,
    size,
  } = req.query;

  const url = `${process.env.PRODUCT_MS_URL}/product-service/api/v1/product/get-product-by-filtering`;

  // Remove undefined values from the params object
  const params = Object.fromEntries(
    Object.entries({
      productName,
      minPrice,
      maxPrice,
      averageRating,
      startDate,
      endDate,
      activeStatus,
      sort,
      page,
      size,
    }).filter(([_, value]) => value !== undefined)
  );

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

  return response.data;
};
