const redisClient = require("../config/redis");
const pool = require("../config/db");
const { dbCircuitBreaker } = require("../utils/circuitBreaker");
const { redisCircuitBreaker } = require("../utils/circuitBreaker");
const winston = require("winston");

//Logger for Monitoring
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/recover_redis_keys.log" })
    ]
});

async function recoverRedisKeys() {
    try {
        logger.info("Recovering recent idempotency keys to Redis...");

        //Fetch Only Keys Created Within the Last 5 Hours
        const recentKeys = await dbCircuitBreaker.execute(async () => {
            const result = await pool.query(
                `SELECT request_id, user_id, status, response_payload, EXTRACT(EPOCH FROM created_at) * 1000 as created_at 
                 FROM idempotency_keys 
                 WHERE created_at >= NOW() - INTERVAL '5 hours'`
            );
            return result.rows;
        });

        if (recentKeys.length === 0) {
            logger.info("No keys found for recovery.");
            return;
        }

        logger.info(`Restoring ${recentKeys.length} keys to Redis...`);

        let successCount = 0;
        let failureCount = 0;

        //Restore Each Key in Redis
        for (const key of recentKeys) {
            try {
                await redisCircuitBreaker.execute(async () => {
                    await redisClient.hSet(`idempotency:${key.request_id}`, {
                        userId: key.user_id,
                        status: key.status,
                        responsePayload: key.response_payload || "",
                        createdAt: key.created_at
                    });

                    await redisClient.expire(`idempotency:${key.request_id}`, 3600); // Keep for 1 hour
                });

                successCount++;
            } catch (error) {
                logger.error(`Failed to restore key ${key.request_id} to Redis:`, error);
                failureCount++;
            }
        }

        logger.info(`Recovery Summary: Restored ${successCount} keys. Failed ${failureCount} keys.`);
        
        //Trigger Alert if Many Keys Failed
        if (failureCount > 10) {
            logger.warn(`ALERT: ${failureCount} keys failed to restore! Check Redis connection.`);
        }

    } catch (error) {
        logger.error("Error recovering Redis keys:", error);
    }
}

//Run on Startup
recoverRedisKeys();

// Schedule Job to Run Every 30 Minutes (Prevents Data Loss on Redis Restart)
setInterval(recoverRedisKeys, 30 * 60 * 1000);

//Export for Manual Trigger if Needed
module.exports = recoverRedisKeys;