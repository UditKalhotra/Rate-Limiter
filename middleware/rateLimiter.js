const Rule = require('../model/rule');
const Request = require('../model/request');

const RateLimiter = async(req, res, next) =>{
    try{

        const identifier = req.apikey._id;
        console.log(identifier);

        const rule = await Rule.findOne({
            apikey:req.apikey._id,
            endpoint:req.originalUrl,
            method:req.method
        });

        if(!rule){
            return next();
        }

        const windowStart = new Date(
            Date.now() - rule.window * 1000
        );

        const requestCount = await Request.countDocuments({
            apikey:req.apikey._id,
            endpoint:req.originalUrl,
            method:req.method,
            timestamp:{
                $gte:windowStart
            }
        });

        if(requestCount >= rule.limit){
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