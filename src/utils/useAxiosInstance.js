const axios = require("axios");

const apiClient = axios.create({
  baseURL: process.env.API_GATEWAY_URL, // Adjust to your API Gateway URL
  withCredentials: true, // Include HTTP-only cookies in requests
});

// Attach JWT token automatically from cookies
apiClient.interceptors.request.use(
  async (config) => {
    const jwtToken = config.headers.Authorization;
    if (!jwtToken) {
      console.log("No JWT token found in request headers");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh expired JWT tokens and retry failed requests
apiClient.interceptors.response.use(
  (response) => response, // Return response if successful
  async (error) => {
    if (error.response?.status === 401) {
      console.log("JWT Expired. Attempting to refresh token...");

      try {
        await axios.get(`${process.env.BFF_URL}/api/v1/auth/refresh`, {
          withCredentials: true, // Send refresh token cookie
        });

        console.log("Token refreshed. Retrying request...");
        return apiClient.request(error.config); // Retry the failed request
      } catch (refreshError) {
        console.error("Token refresh failed. Redirecting to login.");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

module.exports = apiClient;
