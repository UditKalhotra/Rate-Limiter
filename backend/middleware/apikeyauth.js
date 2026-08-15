const API = require('../model/apikey');
const AppError = require('../utils/AppError');
const { hashKey } = require('../utils/apiKeyCrypto');

const apikeyAuth = async(req, res,next) => {

    try {
        const key = req.headers["x-api-key"];

        if(!key){
             return next(new AppError("API key is missing: ",404));
        }

        // Direct O(1) lookup via the SHA-256 hash instead of looping over
        // every stored key and running bcrypt.compare() on each one.
        const matchedkey = await API.findOne({ keyHash: hashKey(key) });

        if (!matchedkey) {
            return next(new AppError("Invalid API key ",401));
        }

        if(matchedkey.status === "revoked"){
            return next(new AppError("API key revoked",401));
        }

        matchedkey.lastUsed = Date.now();
        matchedkey.requestCount += 1;
        await matchedkey.save();

        req.apikey = matchedkey;

        next();

    } catch (error) {
        next(error);
    }
}

module.exports = apikeyAuth;