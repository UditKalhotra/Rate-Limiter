const Rule = require('../model/rule');
const Request = require('../model/request');
const redisClient = require("../config/redis");
const checkSlidingWindow = require("../config/slidingWindow");
const {tokenBucket} = require("../config/tokenBucket");
const AppError = require('../utils/AppError');
const checkLimit = require("../service/checkLimit");

const RateLimiter = async(req, res, next) =>{
    try{

        const resource = req.baseUrl + req.path;
        const result = await checkLimit({
            apikeyId:req.apikey._id,
            resource: resource,
            method: req.method
        });

        if(result.error){
            return res.status(403).json({ message: result.error });

        }

        if(!result.allowed){
            return next(new AppError("Too many Request",429));
        }

        next();

    }catch(error){
        next(error);
    }
        
};

module.exports = RateLimiter;