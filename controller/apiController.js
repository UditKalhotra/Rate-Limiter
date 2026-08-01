const crypto = require("crypto");
const API = require('../model/apikey');

exports.createAPIkey = async(req, res) => {
    try {
        const { name } = req.body;

        if(!name){
            return res.status(400).json({
                message: "The name is Required : "
            })
        }

        const generateKey = crypto.randomBytes(24).toString("hex");

        const apiKey = await API.create({
            name,
            key: generateKey
        });

        res.status(200).json({
            message: "API Key Created u",
            apiKey
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
        
    }
}

exports.getallAPI = async(req, res) => {
    try {

        const apiKeys = await API.find();

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
        const deleteKey = await API.findByIdAndDelete(req.params.id);

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