const Request = require("../model/request");


exports.getStats = async(req,res)=>{

    try{

        const totalRequests = await Request.countDocuments();


        const allowedRequests = await Request.countDocuments({
            status:"allowed"
        });


        const blockedRequests = await Request.countDocuments({
            status:"blocked"
        });


        res.json({
            totalRequests,
            allowedRequests,
            blockedRequests
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};