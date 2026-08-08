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

exports.getMostUsedAPI = async(req, res) => {
    try {
        const result = await Request.aggregate([
            {
                $group:{
                    _id:{
                        endpoint:"$endpoint",
                        method:"$method"
                    },
                    count:{
                        $sum:1
                    }
                }
            },
            {
                $sort:{
                    count:-1
                }
            },

            {
                $limit:5
            }
        ]);

        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

exports.getAbusivekeys = async(req, res) => {
    try {
        const result = await Request.aggregate([
            {
                $group:{
                    _id:"$apikey",

                    totalRequest:{
                        $sum:1
                    },

                    blockedRequest:{
                        $sum:{
                            $cond:[
                                {
                                    $eq:[
                                        "$status",
                                        "blocked"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },{
                $project:{
                    _id:0,
                    apikey:"$_id",
                    totalRequest:1,
                    blockedRequest:1,
                    blocketPercentage:{
                        $multiply:[
                            {
                                $divide:[
                                    "$blockedRequest",
                                    "$totalRequest"

                                ]
                            },
                            100
                        ]
                    }
                }
            },
            {
                $sort:{
                    blockedPercentage:-1
                }
            },
            {
                $limit:5
            }
        ]);

        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

exports.getRequestsOverTime = async(req,res)=>{

try{

            const result = await Request.aggregate([


         {
    $group:{

        _id:{
            hour:{
                $hour:"$timestamp"
            }
        },

        requests:{
            $sum:1
        }

    }
        },


{
    $sort:{
        "_id.hour":1
    }
},


{
    $project:{

        _id:0,

        hour:"$_id.hour",

        requests:1

    }
}


]);


res.json(result);


}
catch(error){

res.status(500).json({
error:error.message
});

}

}

exports.getDashboard = async(req,res)=>{

try{


const totalRequests =
await Request.countDocuments();



const allowedRequests =
await Request.countDocuments({
    status:"allowed"
});


const blockedRequests =
await Request.countDocuments({
    status:"blocked"
});



const topAPIs = await Request.aggregate([

{
    $group:{
        _id:{
            endpoint:"$endpoint",
            method:"$method"
        },
        requests:{
            $sum:1
        }
    }
},

{
    $sort:{
        requests:-1
    }
},

{
    $limit:5
},

{
    $project:{
        _id:0,
        endpoint:"$_id.endpoint",
        method:"$_id.method",
        requests:1
    }
}

]);



const abusiveKeys = await Request.aggregate([

{
    $group:{
        _id:"$apikey",

        totalRequests:{
            $sum:1
        },

        blockedRequests:{
            $sum:{
                $cond:[
                    {
                        $eq:[
                            "$status",
                            "blocked"
                        ]
                    },
                    1,
                    0
                ]
            }
        }
    }
},

{
    $project:{
        _id:0,

        apiKey:"$_id",

        blockedPercentage:{
            $multiply:[
                {
                    $divide:[
                        "$blockedRequests",
                        "$totalRequests"
                    ]
                },
                100
            ]
        }
    }
},

{
    $sort:{
        blockedPercentage:-1
    }
},

{
    $limit:5
}

]);



const traffic = await Request.aggregate([

{
    $group:{
        _id:{
            hour:{
                $hour:"$timestamp"
            }
        },

        requests:{
            $sum:1
        }
    }
},

{
    $sort:{
        "_id.hour":1
    }
},

{
    $project:{
        _id:0,
        hour:"$_id.hour",
        requests:1
    }
}

]);



res.json({

overview:{
    totalRequests,
    allowedRequests,
    blockedRequests
},

topAPIs,

abusiveKeys,

traffic

});


}
catch(error){

res.status(500).json({
    error:error.message
});

}

}