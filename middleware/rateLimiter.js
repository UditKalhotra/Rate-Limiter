const Rule = require('../model/rule');
const Request = require('../model/request');
const redisClient = require("../config/redis");
const checkSlidingWindow = require("../config/slidingWindow");
const {tokenBucket} = require("../config/tokenBucket");
const AppError = require('../utils/AppError');

const RateLimiter = async(req, res, next) =>{
    try{

        const identifier = req.apikey._id;

        const key = `rate_limit:${identifier}:${req.originalUrl}`;

        const rulekey = `rule:${req.apikey._id}:${req.originalUrl}:${req.method}`;

        let rule = await redisClient.get(rulekey);

        if(rule){
            rule = JSON.parse(rule);
        }else{
            rule = await Rule.findOne({
                apikey:req.apikey._id,
                endpoint:req.originalUrl,
                method:req.method
            });

            if(rule){
                await redisClient.set(rulekey, JSON.stringify(rule),{
                    EX:300
                });
            }else{
                return next(new AppError("The rule is not founded in mongoDB",403));
            }

        }

        let result;

        if(rule.algorithm === "token_bucket"){
            const bucketKey = `token_bucket:${identifier}:${req.originalUrl}`;

            result = await tokenBucket(
                bucketKey,
                rule.capacity,
                rule.refillRate
            )

        }else{

            result = await checkSlidingWindow(
            key,
            rule.limit,
            rule.window * 1000
        );

        }


        

        if(!result.allowed){
            await Request.create({
                apikey:req.apikey._id,
                endpoint:req.originalUrl,
                method:req.method,
                status:"blocked"
            });

           return next(new AppError("Too many Request",429));
           
        }

        await Request.create({
            apikey:req.apikey._id,
            endpoint:req.originalUrl,
            method:req.method,
            status:"allowed"
        });

        next();



    }catch(error){
        next(error);
    }
        
};

module.exports = RateLimiter;