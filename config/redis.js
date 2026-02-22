const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const client = redis.createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => {
    if (err.code !== 'ECONNREFUSED') {
        console.log('Redis Client Error', err);
    }
});

const connectRedis = async () => {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Could not connect to Redis. Session caching will be disabled.');
    }
};

module.exports = { client, connectRedis };
