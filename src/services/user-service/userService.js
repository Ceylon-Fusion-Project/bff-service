const axios = require("axios");

exports.completeRegistration = async (req) => {
  //const token = req.kauth.grant.access_token.token;// Extract authentication token from req
  const token = req.cookies.jwt;
  if (!token) throw new Error("Unauthorized");
  const url = `${process.env.API_GATEWAY_URL}/identity-service/api/v1/users/register`;

  const response = await axios.post(url, req.body, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach token for authorization
    },
  });

  return response.data; // Return backend response to the front-end
};
