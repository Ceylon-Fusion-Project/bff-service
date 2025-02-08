const redisClient = require("../config/redis");
const pool = require("../config/db");
const { dbCircuiteBreaker } = require("../utils/circuitBreaker");

async function idempotencyMiddleware(req, res, next) {
  const requestId = req.headers["x-idempotency-key"];
  const userId = req.user?.id || "guest";

  if (!requestId) {
    return res.status(400).json({ error: "Missing X-Idempotency-Key header" });
  }

  try {
    console.log(`Processing request: ${requestId} for user: ${userId}`);

    // 🔹 Step 1: Check Redis for Existing Idempotency Key (Fast Lookup)
    const cachedResponse = await redisClient.get(`idempotency:${requestId}`);

    if (cachedResponse && cachedResponse.status === "processed") {
      console.log("Returning cached response from Redis");
      return res.status(200).json(JSON.parse(cachedResponse.responsePayload));
    }

    const isSet = await redisClient.setNX(
      `idempotency:${requestId}:lock`,
      "locked"
    );
    if (!isSet) {
      console.log("Another request is processing this ID. Waiting...");
      return res
        .status(429)
        .json({ error: "Duplicate request detected, try again later." });
    }

    await redisClient.expire(`idempotency:${requestId}:lock`, 60); // 1-minute lock expiry

    await redisClient.hSet(`idempotency:${requestId}`, {
      userId,
      status: "pending",
      createdAt: Date.now(),
    });
    await redisClient.expire(`idempotency:${requestId}`, 3600); // 1-hour expiry

    res.sendResponse = res.json;
    res.json = async (body) => {
      await redisClient.hSet(`idempotency:${requestId}`, {
        responsePayload: JSON.stringify(body),
        status: "processed",
      });

      console.log(
        `Request ${requestId} processed successfully (Stored in Redis)`
      );

      // 🔹 Try Writing to DB with Circuit Breaker
      try {
        await dbCircuitBreaker.execute(async () => {
          await pool.query(
            `INSERT INTO idempotency_keys (request_id, user_id, status, response_payload, created_at)
                         VALUES ($1, $2, 'processed', $3, NOW())
                         ON CONFLICT (request_id) 
                         DO UPDATE SET status = 'processed', response_payload = EXCLUDED.response_payload, updated_at = NOW()`,
            [requestId, userId, JSON.stringify(body)]
          );
        });
        console.log(`Synced request ${requestId} to DB.`);
      } catch (error) {
        console.error(
          "DB is down. Storing request in Redis for later sync."
        );
        await redisClient.sAdd("failed_db_sync", requestId);
      }

      res.sendResponse(body);
    };
    next();
  } catch (err) {
    console.error("Redis error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await redisClient.del(`idempotency:${requestId}:lock`);
  }
}

module.exports = idempotencyMiddleware;
