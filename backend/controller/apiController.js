const crypto = require("crypto");
const API = require('../model/apikey');
const AppError = require("../utils/AppError");
const { hashKey, encryptKey, decryptKey } = require("../utils/apiKeyCrypto");

exports.createAPIkey = async(req, res,next) => {
    try {
        const { name } = req.body;

        if(!name){
            return next(new AppError("The name is Required : ",400));
        }

        const generateKey = crypto.randomBytes(24).toString("hex");

        const apiKey = await API.create({
            name,
            keyHash: hashKey(generateKey),
            keyEncrypted: encryptKey(generateKey),
            owner:req.user.id
        });

        res.status(201).json({
            message: "API Key Created",
            apiKey: generateKey,
            id: apiKey._id
        })

    } catch (error) {
        next(error);        
    }
}

// GET /api-key/register/:id/reveal — decrypt and return the original key
// so the owner can view it again from the dashboard, behind an explicit
// button click (not returned as part of the normal list response).
exports.revealAPIkey = async(req, res,next) => {
    try {
        const apikey = await API.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if(!apikey){
            return next(new AppError("API key not found",404));
        }

        res.status(200).json({
            apiKey: decryptKey(apikey.keyEncrypted)
        });

    } catch (error) {
        next(error);
    }
}

exports.getallAPI = async(req, res,next) => {
    try {

        const apiKeys = await API.find({
            owner: req.user.id
        });

        res.status(200).json({
            apiKeys
        });

    } catch (error) {

       next(error);

    }
}

exports.deleteAPI = async(req, res,next) => {
    try {
        const deleteKey = await API.findOneAndDelete(
            {
            _id:req.params.id,
            owner:req.user.id
        });

        if(!deleteKey){
            return next(new AppError("THe thing u are trying to delte doesn't exist",404));
        }

         res.status(200).json({
            message: "API key deleted successfully"
        });

    } catch (error) {
        next(error);
    }
}

exports.revokeAPI = async(req, res,next) => {

    try{

    const { id } = req.params;

    const apikey = await API.findOneAndUpdate(
        {
            _id:id,
            owner:req.user.id
        },
        {
            status:"revoked"
        },
        {
            new: true
        }
    );

    if(!apikey){
        return next(new AppError("API key not found",404));
    };

    res.status(200).json({
        message:"API key is revoked successfull",
        apikey
    })
}catch(error){
    next(error);
}

}