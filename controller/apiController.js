const crypto = require("crypto");
const API = require('../model/apikey');
const bcrypt = require("bcrypt");

exports.createAPIkey = async(req, res) => {
    try {
        const { name } = req.body;

        if(!name){
            return res.status(400).json({
                message: "The name is Required : "
            })
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
        res.status(500).json({
            message: error.message
        });
        
    }
}

exports.getallAPI = async(req, res) => {
    try {

        const apiKeys = await API.find({
            owner: req.user.id
        });

        res.status(200).json({
            apiKeys
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

exports.deleteAPI = async(req, res) => {
    try {
        const deleteKey = await API.findByIdAndDelete(
            {
            id:req.params.id,
            owner:req.user.id
        });

        if(!deleteKey){
            return res.status(404).json({
                message: "THe thing u are trying to delte doesn't exist"
            })
        }

         res.status(200).json({
            message: "API key deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

exports.revokeAPI = async(req, res) => {

    try{

    const { id } = req.params;

    const apikey = await API.findByIdAndUpdate(
        {
            id,owner:req.user.id
        },
        {
            status:"revoked"
        },
        {
            new: true
        }
    );

    if(!apikey){
        return res.status(404).json({
            message: "API key not found: "
        });
    };

    res.status(200).json({
        message:"API key is revoked successfull",
        apikey
    })
}catch(error){
    res.status(500).json({
            message:error.message
        });
}

}