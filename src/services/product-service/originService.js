const axios = require("axios");

exports.saveOrigin = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product-origin/save-origin`;

  const response = await axios.post(url, req.body, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach token for authorization
    },
  });

  return response.data; // Return backend response to the front-end
};

exports.getOriginById = async (req) => {
  const { originID } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product-origin/get-origin-by-origin-id`;

  const response = await axios.get(url, {
    params: { originID },
  });
  return response.data;
};

exports.updateOriginDetails = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { originID } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product-origin/update-origin`;

  console.log(originID);
  const response = await axios.patch(url, req.body, {
    headers: { Authorization: `Bearer ${token}` },
    params: { originID },
  });

  return response.data;
};

exports.deleteOriginByID = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { originID } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product-origin/delete-origin-by-id`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { originID },
  });

  return response.data;
};

exports.getAllOrigins = async (req) => {
  const { page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/product-service/api/v1/product-origin/get-all-origins`;
  const response = await axios.get(url, {
      params: {
        page,
        size,
      },
  });
  return response.data;
};