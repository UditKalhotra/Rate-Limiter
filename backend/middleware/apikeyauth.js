const API = require('../model/apikey');
const bcrypt = require("bcrypt");
const AppError = require('../utils/AppError');

const apikeyAuth = async(req, res,next) => {

    try {
        const key = req.headers["x-api-key"];

        console.log(key);
        if(!key){
             return next(new AppError("API key is missing: ",404));
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
                    return next(new AppError("API key revoked",401));
                }

                storedkey.lastUsed = Date.now();
                storedkey.requestCount += 1;

                await storedkey.save();


               matchedkey = storedkey;
               break;
            }
        };

        if (!matchedkey) {
            return next(new AppError("Invalid API key ",401));
        }

        req.apikey = matchedkey;

        next();

    } catch (error) {
        next(error);
    }
}

module.exports = apikeyAuth;