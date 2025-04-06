const axios = require("axios");

exports.saveAccommodation = async (req) => {
  //const token = req.kauth.grant.access_token.token;// Extract authentication token from req
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/accommodations/save-accommodation`;

  const response = await axios.post(url, req.body, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach token for authorization
    },
  });

  return response.data; // Return backend response to the front-end
};

exports.getAllAccommodation = async (req) => {
  const { page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/accommodations/get-all-accommodations-paginated`;
  //const url = `http://localhost:8080/api/v1/product/get-all-products`;
  const response = await axios.get(url, {
    params: {
      page,
      size
    },
  });

  return response.data;
};

exports.getEntireAccommodations = async () => {
    const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/accommodations/get-all-accommodations`;
    const response = await axios.get(url);
    return response.data;
  };

exports.getAccommodationById = async (req) => {
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/accommodations/get-accommodation-details-by-id`;

  const response = await axios.get(url, {
    params: { id },
  });
  return response.data;
};

exports.updateAccommodationDetails = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/accommodations/update-accommodation-details`;

  const response = await axios.patch(url, req.body, {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });

  return response.data;
};

exports.deleteAccommodationByID = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/accommodations/delete-accommodation-by-id`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });

  return response.data;
};

exports.getAccommodationByFiltering = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const {
    accommodationName,
    accommodationType,
    location,
    isAvailable,
    sort,
    page,
    size,
  } = req.query;

  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/accommodations/get-accommodation-by-filtering`;

  // Remove undefined values from the params object
  const params = Object.fromEntries(
    Object.entries({
      accommodationName,
      accommodationType,
      location,
      isAvailable,
      sort,
      page,
      size,
    }).filter(([_, value]) => value !== undefined)
  );

  const response = await axios.get(url, {
    //headers: { Authorization: `Bearer ${token}` },
    params,
  });

  return response.data;
};
