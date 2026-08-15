require('dotenv').config();

const app = require('./app');
const redisClient = require("./config/redis");

const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        await redisClient.connect();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (err) {
        console.log("Redis connection failed:", err);
    }
}

startServer()