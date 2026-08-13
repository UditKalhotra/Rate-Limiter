require('dotenv').config();
const app = require('./app');
const redisClient = require("./config/redis");
const PORT = process.env.PORT || 4000;
redisClient.connect();


app.listen(PORT, (req, res) => {
    console.log("Server is Running : ");
})