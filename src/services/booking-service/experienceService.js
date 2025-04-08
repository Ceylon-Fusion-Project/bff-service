const axios = require("axios");

exports.saveExperience = async (req) => {
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");

  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/experience-center/save-experience-center`;

  // Clone the request body and explicitly set required fields
  const payload = {
    // experienceCode: req.body.experienceCenterCode,
    // experienceName: req.body.experienceCenterName,
    // experienceDescription: req.body.experienceCenterDescription,
    // location: req.body.location,
    // expCenterMapLink: req.body.locationMapLink,
    // expDemoVideoLink: req.body.demoVideoLink,
    // available: true,
    // totalPrice: 150,
    experienceCode: req.body.experienceCode,
    experienceName: req.body.experienceName,
    experienceDescription: req.body.experienceDescription,
    location: req.body.location,
    expCenterMapLink: req.body.locationMapLink,
    expDemoVideoLink: req.body.demoVideoLink,
    available: true,
    totalPrice: req.body.totalPrice ?? 0, // use the provided value, fallback to 0
    events: req.body.events ?? [],
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

exports.getAllExperience = async (req) => {
  const { page, size } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/experience-center/get-all-experience-centers-paginated`;
  //const url = `http://localhost:8080/api/v1/product/get-all-products`;
  const response = await axios.get(url, {
    params: {
      page,
      size,
    },
  });

  return response.data;
};

exports.getEntireExperience = async () => {
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/experience-center/get-all-experience-centers`;
  const response = await axios.get(url);
  return response.data;
};

exports.getExperienceById = async (req) => {
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/experience-center/get-experience-center-details-by-id`;

  const response = await axios.get(url, {
    params: { id },
  });
  return response.data;
};

// exports.updateExperienceDetails = async (req) => {
//   //const token = req.kauth.grant.access_token.token;
//   const token = req.cookies.jwt;
//   if (!token) throw new Error("Unauthorized");
//   const { id } = req.query;
//   const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/accommodations/update-experience-center-details`;

//   const response = await axios.patch(url, req.body, {
//     headers: { Authorization: `Bearer ${token}` },
//     params: { id },
//   });

//   return response.data;
// };
exports.updateExperienceDetails = async (req) => {
    const token = req.cookies.jwt;
    if (!token) throw new Error("Unauthorized");
  
    const { id } = req.query;
    const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/experience-center/update-experience-center-details`;
  
    // Build only the required payload
    const payload = {
      experienceName: req.body.experienceName,
      experienceDescription: req.body.experienceDescription,
      location: req.body.location,
      expCenterMapLink: req.body.locationMapLink, // map field name
      expDemoVideoLink: req.body.demoVideoLink,
      totalPrice: req.body.totalPrice ?? 0,
      available: true, // always mark available true for now
    };
  
    console.log("Sending update payload:", payload); // Optional logging
    //console.log("Calling PATCH URL:", `${BOOKING_SERVICE_URL}/booking-service/api/v1/experience-center/update-experience-details?id=${id}`);
    const response = await axios.patch(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
      params: { id },
    });
  
    return response.data;
  };
  

exports.deleteExperienceByID = async (req) => {
  //const token = req.kauth.grant.access_token.token;
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const { id } = req.query;
  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/experience-center/delete-experience-center-by-id`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });

  return response.data;
};

exports.getExperienceByFiltering = async (req) => {
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

  const url = `${process.env.API_GATEWAY_URL}/booking-service/api/v1/experience-center/get-experience-center-by-filtering`;

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
