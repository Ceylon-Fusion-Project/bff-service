const axios = require("axios");

exports.savePackage= async (req) => {
  //const token = req.kauth.grant.access_token.token;// Extract authentication token from req
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/package/save-package`;

  const response = await axios.post(url, req.body, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach token for authorization
    },
  });

  return response.data; // Return backend response to the front-end
};

exports.getAllPackages = async (req) => {
  const { page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/package/get-all-packages-paginated`;
  //const url = `http://localhost:8080/api/v1/product/get-all-products`;
  const response = await axios.get(url, {
    params: {
      page:0,
      size:10,
    },
  });

  return response.data;
};

exports.getEntirePackages = async () => {
    const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/package/get-all-packages`;
    const response = await axios.get(url);
    return response.data;
  };

exports.getPackageById = async (req) => {
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/package/get-package-details-by-id`;

  const response = await axios.get(url, {
    params: { id },
  });
  return response.data;
};

exports.updatePackageDetails = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/package/update-package-details`;

  const response = await axios.patch(url, req.body, {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });

  return response.data;
};

exports.deletePackageByID = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/package/delete-package-by-id`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });

  return response.data;
};

