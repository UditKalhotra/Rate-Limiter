const Rule = require('../model/rule');
const Request = require('../model/request');
const redisClient = require("../config/redis");
const checkSlidingWindow = require("../config/slidingWindow");

const RateLimiter = async(req, res, next) =>{
    try{

        const identifier = req.apikey._id;

        const key = `rate_limit:${identifier}:${req.originalUrl}`;

        const rulekey = `rule:${req.apikey._id}:${req.originalUrl}:${req.method}`;

        let rule = await redisClient.get(rulekey);

        if(rule){
            rule = JSON.parse(rule);
        }else{
                            console.log("feteching rule from mongodb");
            rule = await Rule.findOne({
                apikey:req.apikey._id,
                endpoint:req.originalUrl,
                method:req.method
            });

            if(rule){
                await redisClient.set(rulekey, JSON.stringify(rule),{
                    EX:3600
                });
            }else{
                return res.status(403).json({
                    message: "the rule is also not founded on the mongoose"
                })
            }

        }

        const result = await checkSlidingWindow(
            key, 
            rule.limit,
            rule.window * 1000
        );

        res.setHeader(
            "X-RateLimit-Limit",
            rule.limit
        );

        res.setHeader(
            "X-RateLimit-Remaining",
            result.remaining
        );

        res.setHeader(
            "X-RateLimit-Reset",
            result.reset
        );

        

        if(!result.allowed){
            await Request.create({
                apikey:req.apikey._id,
                endpoint:req.originalUrl,
                method:req.method,
                status:"blocked"
            });

           return res.status(429).json({
                message: "Too many Request"
            });
        }

        await Request.create({
            apikey:req.apikey._id,
            endpoint:req.originalUrl,
            method:req.method,
            status:"allowed"
        });

        next();



    }catch(error){

        res.status(500).json({
            message: error.message
        });
    }
        
};

module.exports = RateLimiter;