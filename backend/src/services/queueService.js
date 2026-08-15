const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');

const redisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null
};

// Check if we should dummy out Redis for local development without a Redis server
const USE_MOCK = process.env.REDIS_HOST === 'localhost' || !process.env.REDIS_HOST;

let connection;
let newsQueue;

if (!USE_MOCK) {
    connection = new Redis(redisOptions);
    newsQueue = new Queue('newsCollection', { connection });
} else {
    console.warn('⚠️  Redis is disabled. Using mock queues. Set REDIS_HOST to a valid Redis instance to enable BullMQ.');
    const mockAdd = async (name, data) => {
        console.log(`[Mock Queue] Added job: ${name}`, data ? data : '');
        return { id: Date.now() };
    };
    newsQueue = { add: mockAdd };
}

// Define workers but don't implement the heavy logic here to avoid circular dependencies
// In a real app, workers might run in a separate process
const initializeWorkers = (processNewsJob) => {
    if (USE_MOCK) {
        console.warn('⚠️  Mock queue is enabled. Workers will not process jobs automatically.');
        return;
    }

    const newsWorker = new Worker('newsCollection', async job => {
        console.log('Processing news job:', job.id);
        await processNewsJob();
    }, { connection });

    newsWorker.on('completed', job => console.log(`News Job ${job.id} has completed!`));
    newsWorker.on('failed', (job, err) => console.log(`News Job ${job.id} has failed with ${err.message}`));
};

const scheduleNewsCollection = async (cronExpression = '0 * * * *') => {
    if (USE_MOCK) {
        console.log(`[Mock Queue] Scheduled news collection with cron: ${cronExpression}`);
        return;
    }
    await newsQueue.add('collectNews', {}, {
        repeat: {
            pattern: cronExpression
        }
    });
};



module.exports = {
    newsQueue,
    initializeWorkers,
    scheduleNewsCollection
};
