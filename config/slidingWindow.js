const redisClient = require("./redis");
const fs = require("fs");
const path = require("path");

const luaScript = fs.readFileSync(
    path.join(__dirname, "slidingWindow.lua"),
    "utf8"
);


const checkSlidingWindow = async (key, limit, windowSize) => {

    const now = Date.now();

    const requestId = `${now}-${Math.random()}`;

    const result = await redisClient.eval(
        luaScript,
        {
            keys: [key],
            arguments: [
                limit.toString(),
                windowSize.toString(),
                now.toString(),
                requestId
            ]
        }
    );


    console.log("Lua result:", result);

    return {
        allowed: result[0] === 1,
        remaining: Number(result[1]),
        reset: Number(result[2])
    };
};


module.exports = checkSlidingWindow;