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

// // idempotencyMiddleware.js
// const { redisClient } = require("../config/redis");
// const pool = require("../config/db");
// const { dbCircuitBreaker } = require("../utils/circuitBreaker");

// async function idempotencyMiddleware(req, res, next) {
//   const requestId = req.headers["x-idempotency-key"];
//   const userId = req.user?.id || "guest";

//   // Declare lockKey up here so it's in scope for the finally block
//   let lockKey = "";

//   if (!requestId) {
//     return res.status(400).json({ error: "Missing X-Idempotency-Key header" });
//   }

//   try {
//     console.log(`Processing request: ${requestId} for user: ${userId}`);

//     // 🔹 Step 1: Check if request is already processed (Retrieve from Redis)
//     const existingData = await redisClient.hGetAll(`idempotency:${requestId}`);
//     if (existingData && existingData.status === "processed") {
//       console.log(`Returning cached response for request ${requestId}`);

//       try {
//         const cachedResponse = JSON.parse(existingData.responsePayload);
//         return res.status(200).json(cachedResponse);
//       } catch (parseError) {
//         console.error("Error parsing cached response:", parseError);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }
//     }

//     // 🔹 Step 2: Acquire a lock to prevent duplicate processing
//     lockKey = `idempotency:${requestId}:lock`; // assign here
//     const lockResult = await redisClient.set(lockKey, "locked", { NX: true, EX: 60 });
//     if (!lockResult) {
//       console.log(`Another request is processing this ID: ${requestId}. Rejecting duplicate.`);
//       return res.status(429).json({ error: "Duplicate request detected. Try again later." });
//     }

//     // 🔹 Step 3: Mark request as "pending" in Redis
//     await redisClient.hSet(`idempotency:${requestId}`, {
//       userId,
//       status: "pending",
//       createdAt: Date.now().toString(),
//     });
//     await redisClient.expire(`idempotency:${requestId}`, 3600); // Expire in 1 hour

//     // 🔹 Step 4: Override `res.json` to store final response in Redis & DB
//     res.sendResponse = res.json;
//     res.json = async (body) => {
//       // Store final response in Redis
//       await redisClient.hSet(`idempotency:${requestId}`, {
//         responsePayload: JSON.stringify(body),
//         status: "processed",
//       });
//       console.log(`Request ${requestId} processed successfully (Stored in Redis)`);

//       // Write to DB with Circuit Breaker
//       try {
//         await dbCircuitBreaker.execute(async () => {
//           await pool.query(
//             `INSERT INTO idempotency_keys (request_id, user_id, status, response_payload, created_at)
//              VALUES ($1, $2, 'processed', $3, NOW())
//              ON CONFLICT (request_id)
//              DO UPDATE SET 
//                status = 'processed', 
//                response_payload = EXCLUDED.response_payload, 
//                updated_at = NOW()`,
//             [requestId, userId, JSON.stringify(body)]
//           );
//         });
//         console.log(`Synced request ${requestId} to DB.`);
//       } catch (dbError) {
//         console.error("DB is down. Storing request in Redis for later sync.");
//         await redisClient.sAdd("failed_db_sync", requestId);
//       }

//       // Send the response to the client
//       res.sendResponse(body);
//     };

//     // Proceed to next middleware or route handler
//     next();

//   } catch (error) {
//     console.error("Redis error:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     // 🔹 Step 5: Release the lock **ONLY IF request is processed**
//     try {
//       const requestStatus = await redisClient.hGet(`idempotency:${requestId}`, "status");
//       if (requestStatus === "processed") {
//         await redisClient.del(lockKey);  // lockKey is accessible here now
//         console.log(`Lock released for ${requestId}`);
//       }
//     } catch (err) {
//       console.error("Redis DEL error:", err);
//     }
//   }
// }

// module.exports = idempotencyMiddleware;

//Working Version
const { redisClient } = require("../config/redis");
const pool = require("../config/db");
const { dbCircuitBreaker } = require("../utils/circuitBreaker");

async function idempotencyMiddleware(req, res, next) {
  const requestId = req.headers["x-idempotency-key"];
  const userId = req.user?.id || "guest";

  // Declare lockKey up here so it's in scope for the finally block
  let lockKey = `idempotency:${requestId}:lock`;

  if (!requestId) {
    return res.status(400).json({ error: "Missing X-Idempotency-Key header" });
  }

  try {
    console.log(`🔄 Processing request: ${requestId} for user: ${userId}`);

    // 🔹 Step 1: Check if request is already processed (Retrieve from Redis)
    const existingData = await redisClient.hGetAll(`idempotency:${requestId}`);
    if (existingData && existingData.status === "processed") {
      console.log(`✅ Returning cached successful response for request ${requestId}`);
      try {
        return res.status(200).json(JSON.parse(existingData.responsePayload));
      } catch (parseError) {
        console.error("❌ Error parsing cached response:", parseError);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    } else if (existingData.status === "failed") {
      console.log(`⚠️ Previous request ${requestId} failed. Retrying...`);
      // Allow the request to proceed instead of returning a failed response
    }

    // 🔹 Step 2: Acquire a lock to prevent duplicate processing
    const lockResult = await redisClient.set(lockKey, "locked", { NX: true, EX: 60 });
    if (!lockResult) {
      console.log(`❌ Another request is processing this ID: ${requestId}. Rejecting duplicate.`);
      return res.status(429).json({ error: "Duplicate request detected. Try again later." });
    }

    // 🔹 Step 3: Mark request as "pending" in Redis
    await redisClient.hSet(`idempotency:${requestId}`, {
      userId,
      status: "pending",
      createdAt: Date.now().toString(),
    });
    await redisClient.expire(`idempotency:${requestId}`, 3600); // Expire in 1 hour

    // 🔹 Step 4: Override `res.json` to store final response in Redis & DB
    res.sendResponse = res.json;
    res.json = async (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {  // ✅ Cache only if request is successful
        await redisClient.hSet(`idempotency:${requestId}`, {
          responsePayload: JSON.stringify(body),
          status: "processed",
        });
        console.log(`✅ Request ${requestId} processed successfully and stored in Redis.`);

        // Write to DB with Circuit Breaker
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
          console.log(`✅ Synced request ${requestId} to DB.`);
        } catch (dbError) {
          console.error("❌ DB is down. Storing request in Redis for later sync.");
          await redisClient.sAdd("failed_db_sync", requestId);
        }
      } else {
        // Request failed, don't cache as processed
        await redisClient.hSet(`idempotency:${requestId}`, {
          responsePayload: JSON.stringify(body),
          status: "failed",
        });
        console.log(`❌ Request ${requestId} failed. Not caching as processed.`);
      }

      res.sendResponse(body);
    };

    // Proceed to next middleware or route handler
    next();

  } catch (error) {
    console.error("❌ Redis error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // 🔹 Step 5: Release the lock **ONLY IF request is processed**
    try {
      const requestStatus = await redisClient.hGet(`idempotency:${requestId}`, "status");
      if (requestStatus === "processed") {
        await redisClient.del(lockKey);
        console.log(`🔓 Lock released for successfully processed request ${requestId}`);
      }
    } catch (err) {
      console.error("❌ Redis DEL error:", err);
    }
  }
}

module.exports = idempotencyMiddleware;
