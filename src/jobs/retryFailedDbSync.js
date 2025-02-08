const redisClient = require("../config/redis");
const pool = require("../config/db");
const { dbCircuitBreaker } = require("../utils/circuitBreaker");
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/retry_failed_sync.log" }),
  ],
});

const redisCircuitBreaker =
  require("../utils/circuitBreaker").redisCircuitBreaker;

async function retryFailedDbSync() {
  try {
    await redisClient.sessionStore("last_retry_job_run", Date.now());
    logger.info("Retry job started: Fetching failed requests...");

    const failedRequests = await redisCircuitBreaker.execute(() =>
      redisClient.sMembers("failed_db_sync")
    );

    if (failedRequests.length === 0) {
      logger.info("No failed DB sync requests.");
      return;
    }

    logger.info(`Retrying ${failedRequests.length} failed DB writes...`);

    const successfulSyncs = [];

    const batchSize = 10;

    for (let i = 0; i < failedRequests.length; i += batchSize) {
      const batch = failedRequests.slice(i, i + batchSize);
      const dbUpdates = [];

      for (const requestId of batch) {
        const requestData = await redisCircuitBreaker.execute(() =>
          redisClient.hGetAll(`idempotency:${requestId}`)
        );

        if (!requestData || !requestData.responsePayload) continue;

        // 🔹 Prepare DB Update Queries
        dbUpdates.push([
          requestId,
          requestData.userId,
          "processed",
          requestData.responsePayload,
        ]);
      }

      if (dbUpdates.length > 0) {
        try {
          await dbCircuitBreaker.execute(async () => {
            const query = `
                            INSERT INTO idempotency_keys (request_id, user_id, status, response_payload, created_at)
                            VALUES ${dbUpdates
                              .map(
                                (_, index) =>
                                  `($${index * 4 + 1}, $${index * 4 + 2}, $${
                                    index * 4 + 3
                                  }, $${index * 4 + 4}, NOW())`
                              )
                              .join(", ")}
                            ON CONFLICT (request_id) 
                            DO UPDATE SET status = 'processed', response_payload = EXCLUDED.response_payload, updated_at = NOW();
                        `;
            const values = dbUpdates.flat();
            await pool.query(query, values);
          });

          logger.info(
            `Successfully synced batch of ${dbUpdates.length} requests.`
          );
          successfulSyncs.push(...batch);
        } catch (error) {
          logger.error(`DB batch sync failed: ${error.message}`);
        }
      }
    }

    if (successfulSyncs.length > 0) {
      await redisCircuitBreaker.execute(() =>
        redisClient.sRem("failed_db_sync", ...successfulSyncs)
      );
      logger.info(
        `Removed ${successfulSyncs.length} successfully synced requests from Redis.`
      );
    }
  } catch (error) {
    logger.error("Error retrying DB sync:", error);
  }
}

//Run Every 5 Minutes & Log Execution
setInterval(retryFailedDbSync, 5 * 60 * 1000);
logger.info("DB Retry Job Scheduled to run every 5 minutes.");

//Expose Job for Manual Execution
module.exports = retryFailedDbSync;
