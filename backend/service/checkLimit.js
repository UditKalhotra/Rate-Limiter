const Rule = require("../model/rule");
const Request = require("../model/request");
const redisClient = require("../config/redis");
const checkSlidingWindow = require("../config/slidingWindow");
const {tokenBucket} = require("../config/tokenBucket");
const mongoose = require("mongoose");

async function checkLimit({apikeyId, resource, method}){
    const key = `rate_limit:${apikeyId}:${resource}`;
    const rulekey = `rule:${apikeyId}:${resource}:${method}`;

    let rule = await redisClient.get(rulekey);

    if(rule){
        rule = JSON.parse(rule);
    }else{
        rule = await Rule.findOne({
            apikey:new mongoose.Types.ObjectId(apikeyId),
            endpoint:resource,
            method: method
        }).lean();

        if(rule){
            await redisClient.set(rulekey, JSON.stringify(rule), {EX: 300});
        }else{
            return {error : "No rule found for this resource/method"};
        }
    }

    let result;

    if(rule.algorithm === "token_bucket"){
        const bucketKey = `token_bucket:${apikeyId}:${resource}`;
        result = await tokenBucket(bucketKey, rule.capacity, rule.refillRate);
    }else{
        result = await checkSlidingWindow(key , rule.limit, rule.window * 1000);
    }

    await Request.create({
        apikey:apikeyId,
        endpoint:resource,
        method: method,
        status: result.allowed ? "allowed":"blocked"
    });

    return result;
}

module.exports = checkLimit;