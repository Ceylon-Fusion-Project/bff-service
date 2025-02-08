const rateLimit = require("express-rate-limit");

//Rate Limit for Idempotency Requests
const idempotencyLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: "Too many idempotent requests, please try again later."
});

//Global API Rate Limit(For All Requests)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: "Too many requests, please try again later."
});

module.exports = {
    idempotencyLimiter,
    globalLimiter
};

