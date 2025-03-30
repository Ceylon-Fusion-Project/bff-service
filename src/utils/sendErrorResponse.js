// src/utils/sendErrorResponse.js

function sendErrorResponse(res, statusCode, message) {
    return res.status(statusCode).json({
      error: message,
      code: statusCode,
    });
  }
  
module.exports = sendErrorResponse;  