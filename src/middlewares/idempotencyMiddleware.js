// const redisClient = require("../config/redis");
// const pool = require("../config/db");
// const { dbCircuiteBreaker } = require("../utils/circuitBreaker");

// async function idempotencyMiddleware(req, res, next) {
//   const requestId = req.headers["x-idempotency-key"];
//   const userId = req.user?.id || "guest";

//   if (!requestId) {
//     return res.status(400).json({ error: "Missing X-Idempotency-Key header" });
//   }

//   try {
//     console.log(`Processing request: ${requestId} for user: ${userId}`);

//     // 🔹 Step 1: Check Redis for Existing Idempotency Key (Fast Lookup)
//     const cachedResponse = await redisClient.get(`idempotency:${requestId}`);

//     if (cachedResponse && cachedResponse.status === "processed") {
//       console.log("Returning cached response from Redis");
//       return res.status(200).json(JSON.parse(cachedResponse.responsePayload));
//     }

//     const isSet = await redisClient.setNX(
//       `idempotency:${requestId}:lock`,
//       "locked"
//     );
//     if (!isSet) {
//       console.log("Another request is processing this ID. Waiting...");
//       return res
//         .status(429)
//         .json({ error: "Duplicate request detected, try again later." });
//     }

//     await redisClient.expire(`idempotency:${requestId}:lock`, 60); // 1-minute lock expiry

//     await redisClient.hSet(`idempotency:${requestId}`, {
//       userId,
//       status: "pending",
//       createdAt: Date.now(),
//     });
//     await redisClient.expire(`idempotency:${requestId}`, 3600); // 1-hour expiry

//     res.sendResponse = res.json;
//     res.json = async (body) => {
//       await redisClient.hSet(`idempotency:${requestId}`, {
//         responsePayload: JSON.stringify(body),
//         status: "processed",
//       });

//       console.log(
//         `Request ${requestId} processed successfully (Stored in Redis)`
//       );

//       // 🔹 Try Writing to DB with Circuit Breaker
//       try {
//         await dbCircuitBreaker.execute(async () => {
//           await pool.query(
//             `INSERT INTO idempotency_keys (request_id, user_id, status, response_payload, created_at)
//                          VALUES ($1, $2, 'processed', $3, NOW())
//                          ON CONFLICT (request_id) 
//                          DO UPDATE SET status = 'processed', response_payload = EXCLUDED.response_payload, updated_at = NOW()`,
//             [requestId, userId, JSON.stringify(body)]
//           );
//         });
//         console.log(`Synced request ${requestId} to DB.`);
//       } catch (error) {
//         console.error(
//           "DB is down. Storing request in Redis for later sync."
//         );
//         await redisClient.sAdd("failed_db_sync", requestId);
//       }

//       res.sendResponse(body);
//     };
//     next();
//   } catch (err) {
//     console.error("Redis error:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     redisClient.del(`idempotency:${requestId}:lock`, (err, result) => {
//       if (err) {
//         console.error("Redis DEL error:", err);
//       } else {
//         console.log(`DEL result: ${result}`);
//       }
//     });
    
//   }
// }

// module.exports = idempotencyMiddleware;

// idempotencyMiddleware.js
const { redisClient } = require("../config/redis");
const pool = require("../config/db");
const { dbCircuitBreaker } = require("../utils/circuitBreaker");

async function idempotencyMiddleware(req, res, next) {
  const requestId = req.headers["x-idempotency-key"];
  const userId = req.user?.id || "guest";

  if (!requestId) {
    return res.status(400).json({ error: "Missing X-Idempotency-Key header" });
  }

  try {
    console.log(`Processing request: ${requestId} for user: ${userId}`);

    // 1) Check Redis for existing record
    //    If we used hSet previously, use hGetAll now:
    const existingData = await redisClient.hGetAll(`idempotency:${requestId}`);

    // hGetAll() returns an object of strings, or {} if none found.
    // For example: { userId: 'guest', status: 'processed', responsePayload: '{"foo":"bar"}' }
    if (existingData.status === "processed") {
      console.log("Returning cached response from Redis");
      return res.status(200).json(JSON.parse(existingData.responsePayload));
    }

    // 2) Acquire a "lock" so only one request processes
    const lockKey = `idempotency:${requestId}:lock`;
    // Using NX: true => set only if not exists; EX: 60 => expires in 60s
    const lockResult = await redisClient.set(lockKey, "locked", { NX: true, EX: 60 });
    if (!lockResult) {
      console.log("Another request is processing this ID. Waiting...");
      return res
        .status(429)
        .json({ error: "Duplicate request detected. Try again later." });
    }

    // 3) Mark this request as "pending"
    await redisClient.hSet(`idempotency:${requestId}`, {
      userId,
      status: "pending",
      createdAt: Date.now().toString(),
    });
    await redisClient.expire(`idempotency:${requestId}`, 3600); // Expire in 1 hour

    // 4) Override res.json so we can store final response in Redis & DB
    res.sendResponse = res.json;
    res.json = async (body) => {
      // Store final response in Redis
      await redisClient.hSet(`idempotency:${requestId}`, {
        responsePayload: JSON.stringify(body),
        status: "processed",
      });
      console.log(`Request ${requestId} processed successfully (Stored in Redis)`);

      // Also write to DB with Circuit Breaker
      try {
        await dbCircuitBreaker.execute(async () => {
          await pool.query(
            `INSERT INTO idempotency_keys (request_id, user_id, status, response_payload, created_at)
             VALUES ($1, $2, 'processed', $3, NOW())
             ON CONFLICT (request_id)
             DO UPDATE SET 
               status = 'processed', 
               response_payload = EXCLUDED.response_payload, 
               updated_at = NOW()`,
            [requestId, userId, JSON.stringify(body)]
          );
        });
        console.log(`Synced request ${requestId} to DB.`);
      } catch (dbError) {
        console.error("DB is down. Storing request in Redis for later sync.");
        await redisClient.sAdd("failed_db_sync", requestId);
      }

      // Finally, send the HTTP response
      res.sendResponse(body);
    };

    // Proceed to next middleware or route handler
    next();

  } catch (error) {
    console.error("Redis error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // 5) Release the lock in a promise-based way
    try {
      const delResult = await redisClient.del(`idempotency:${requestId}:lock`);
      console.log(`Lock DEL result: ${delResult}`);
    } catch (err) {
      console.error("Redis DEL error:", err);
    }
  }
}

module.exports = idempotencyMiddleware;
