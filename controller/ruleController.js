const express = require('express');
const Rule = require('../model/rule');
const redisClient = require("../config/redis");

exports.createRule = async(req, res) => {
    try {

        const {
            endpoint, 
            method,
            limit,
            window
        } = req.body;

        const rule = await Rule.create({
            apikey:req.apikey._id,
            endpoint,
            method,
            limit,
            window

        });
        res.status(200).json({
            status: "success",
            Data: rule
        })
        
    } catch (error) {
        res.status(404).json({
            status: "Failed",
            message: error.message
        })
    }
}

exports.getallRules = async(req, res) => {

    try{
    const allRules = await Rule.find({
        apikey:req.apikey._id
    });
    res.status(200).json({
        status: "Success",
        Rules: allRules
    })
    }catch(error){
        res.status(400).json({
            status: "Fail",
            message: error
        })
    }
}

exports.updateRule = async(req, res) => {
    try {
        const { id } = req.params;
        const updatetask = await Rule.findOneAndUpdate({
            _id:id,
            apikey:req.apikey._id
        }, req.body,{
            new: true,
            runValidators: true
        });


        if(!updatetask){
            return res.status(404).json({
                message: "The element u are trying to access doesn't exist"
            })
        }

        const key = `rule:${updatetask.apikey}:${updatetask.endpoint}:${updatetask.method}`;
        await redisClient.del(key);

        res.status(200).json({
            status: "Success",
            updatedRule: updatetask
        })
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            message: error.message
        })
    }
}

exports.DeleteRule = async(req, res) => {
    try {
        const { id } = req.params;
        const deletetask = await Rule.findOneAndDelete({
    _id:id,
    apikey:req.apikey._id
});

        if(!deletetask){
            return res.status(404).json({
                message: "The element u are trying to delete doesn't exist"
            })
        }

        const key = `rule:${deletetask.apikey}:${deletetask.endpoint}:${deletetask.method}`;
        await redisClient.del(key);

        res.status(200).json({
            status: "Success"
        })
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            message: error.message
        })
    }
}

