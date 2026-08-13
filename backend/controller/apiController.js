const crypto = require("crypto");
const API = require('../model/apikey');
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");

exports.createAPIkey = async(req, res,next) => {
    try {
        const { name } = req.body;

        if(!name){
            return next(new AppError("The name is Required : ",400));
        }

        const generateKey = crypto.randomBytes(24).toString("hex");

        const hashedKey = await bcrypt.hash(generateKey, 10);

        const apiKey = await API.create({
            name,
            key: hashedKey,
            owner:req.user.id
        });
        console.log(apiKey);
        console.log("Saved ID:", apiKey._id);
console.log("Collection:", API.collection.name);

        res.status(201).json({
            message: "API Key Created u",
            apiKey: generateKey
        })

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