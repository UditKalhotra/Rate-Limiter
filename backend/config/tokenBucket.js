const redisclient = require("./redis");
const fs = require("fs");
const path = require("path");

const script = fs.readFileSync(
    path.join(__dirname, "tokenBucket.lua"),
    "utf8"
)

exports.tokenBucket = async(
    key,
    capacity,
    refillRate
) => {

    const now = Date.now();

    const result = await redisclient.eval(
        script,
        {
            keys:[key],

            arguments:[
                capacity.toString(),
                refillRate.toString(),
                now.toString()
            ]
        }
    )

    return {
        allowed: result[0] === 1,
        remaining: Number(result[1]),
        reset: Number(result[2])
    }

}