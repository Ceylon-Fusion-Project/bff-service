// const redisClient = require("../config/redis");

// class CircuitBreaker {
//   constructor(serviceName, failureThreshold = 3, coolDownTime = 60000) {
//     this.serviceName = serviceName;
//     this.failureThreshold = failureThreshold;
//     this.coolDownTime = coolDownTime;
//   }
//   async getFailureCount() {
//     const count = await redisClient.get(`circuit:${this.serviceName}:failures`);
//     return count ? parseInt(count, 10) : 0;
//   }

//   async setFailureCount(count) {
//     await redisClient.set(`circuit:${this.serviceName}:failures`, count);
//   }

//   async getLastFailureTime() {
//     const lastTime = await redisClient.get(
//       `circuit:${this.serviceName}:lastFailureTime`
//     );
//     return lastTime ? parseInt(lastTime) : 0;
//   }

//   async setLastFailureTime(time) {
//     await redisClient.set(`circuit:${this.serviceName}:lastFailureTime`, time);
//   }

//   async execute(action) {
//     const failureCount = await this.getFailureCount();
//     const lastFailureTime = await this.getLastFailureTime();
//     const timeSinceLastFailure = Date.now() - lastFailureTime;

//     if (failureCount >= this.failureThreshold) {
//       if (timeSinceLastFailure < this.cooldownPeriod) {
//         console.log(
//           `Circuit breaker for ${this.serviceName} triggered. Skipping action.`
//         );
//         throw new Error(`${this.serviceName} is temporarily unavailable.`);
//       } else {
//         console.log(`Resetting circuit breaker for ${this.serviceName}.`);
//         await this.setFailureCount(0); // Reset failures after cooldown
//       }
//     }
//     try {
//       const result = await action(); // Attempt execution
//       await this.setFailureCount(0); // Reset failures on success
//       return result;
//     } catch (error) {
//       const newFailureCount = failureCount + 1;
//       await this.setFailureCount(newFailureCount);
//       await this.setLastFailureTime(Date.now());

//       console.error(
//         `${this.serviceName} failure #${newFailureCount}:`,
//         error.message
//       );

//       // Exponential Backoff (Increase Cooldown)
//       if (newFailureCount >= this.failureThreshold) {
//         this.cooldownPeriod *= 2; // Double the cooldown on repeated failures
//         console.warn(
//           `Increasing cooldown to ${
//             this.cooldownPeriod / 1000
//           }s due to repeated failures.`
//         );
//       }

//       throw error;
//     }
//   }
// }

// // Create circuit breakers for different services
// module.exports = {
//     dbCircuitBreaker: new CircuitBreaker("database"),
// };

const { redisClient } = require("../config/redis");

class CircuitBreaker {
  constructor(serviceName, failureThreshold = 3, coolDownTime = 60000) {
    this.serviceName = serviceName;
    this.failureThreshold = failureThreshold;
    this.coolDownTime = coolDownTime;
  }

  async getFailureCount() {
    const count = await redisClient.get(`circuit:${this.serviceName}:failures`);
    return count ? parseInt(count, 10) : 0;
  }

  async setFailureCount(count) {
    await redisClient.set(`circuit:${this.serviceName}:failures`, count);
  }

  async getLastFailureTime() {
    const time = await redisClient.get(`circuit:${this.serviceName}:lastFailureTime`);
    return time ? parseInt(time) : 0;
  }

  async setLastFailureTime(time) {
    await redisClient.set(`circuit:${this.serviceName}:lastFailureTime`, time);
  }

  async execute(action) {
    const failures = await this.getFailureCount();
    const lastTime = await this.getLastFailureTime();

    if (failures >= this.failureThreshold && Date.now() - lastTime < this.coolDownTime) {
      throw new Error(`[CIRCUIT OPEN] ${this.serviceName} temporarily disabled.`);
    }

    try {
      const result = await action();
      await this.setFailureCount(0);
      return result;
    } catch (error) {
      const newCount = failures + 1;
      await this.setFailureCount(newCount);
      await this.setLastFailureTime(Date.now());
      console.error(`[${this.serviceName}] failure #${newCount}:`, error.message);
      throw error;
    }
  }
}

module.exports = {
  orderCircuitBreaker: new CircuitBreaker("orderMS"),
  productCircuitBreaker: new CircuitBreaker("productMS"),
};
