const API = require('../model/apikey');
const bcrypt = require("bcrypt");

const apikeyAuth = async(req, res,next) => {

    try {
        const key = req.headers["x-api-key"];

        if(!key){
             return res.status(401).json({
                message: "API key missing"
            });
        }

        const apikey = await API.find();

        let matchedkey = null;

        for(const storedkey of apikey){
            const isValid = await bcrypt.compare(
                key, 
                storedkey.key
            )

             if(isValid){

                if(storedkey.status === "revoked"){
                    return res.status(401).json({
                        message:"API key revoked :"
                    });
                }

                storedkey.lastUsed = Date.now();
                storedkey.requestCount += 1;

                await storedkey.save();


               matchedkey = storedkey;
               break;
            }
        };

        if (!matchedkey) {
            return res.status(401).json({
                message: "Invalid API key"
            });
        }

        req.apikey = matchedkey;

        next();

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

module.exports = apikeyAuth;