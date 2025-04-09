const axios = require("axios");
const axiosRetry = require("axios-retry").default;

const axiosInstance = axios.create({
  timeout: 5000,
});

// Apply retry logic
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => axiosRetry.isRetryableError(error),
});

module.exports = axiosInstance;
