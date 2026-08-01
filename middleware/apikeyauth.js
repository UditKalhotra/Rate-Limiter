const API = require('../model/apikey');

const apikeyAuth = async(req, res,next) => {

    try {
        const key = req.headers["x-api-key"];

        if(!key){
             return res.status(401).json({
                message: "API key missing"
            });
        }

        const apikey = await API.findOne({
            key:key
        });

        if (!apikey) {
            return res.status(401).json({
                message: "Invalid API key"
            });
        }

        req.apikey = apikey;

        next();

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

module.exports = apikeyAuth;