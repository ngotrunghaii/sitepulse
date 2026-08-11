import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

console.log("SitePulse worker starting...");

// We configure a simple Redis client just to test the connection.
// If it fails, we skip starting the worker.
const testConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    if (times > 1) {
      return null; // Stop retrying after the first failure
    }
    return 1000;
  },
});

testConnection.on('error', (err: any) => {
  if (err.code === 'ECONNREFUSED') {
    console.warn("Redis is not configured, worker skipped");
    testConnection.disconnect();
    // Keep process alive so it doesn't exit and trigger restarts in some environments
    setInterval(() => {}, 1000 * 60 * 60);
  }
});

testConnection.on('ready', () => {
  console.log("Redis connected. Starting BullMQ worker...");
  
  const connection = testConnection;
  
  const worker = new Worker('monitoring-queue', async job => {
    console.log(`Processing job ${job.id}`);
    // In a real app, this would perform the website check
  }, { connection });

  worker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
  });
});

