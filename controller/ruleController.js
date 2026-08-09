const express = require('express');
const Rule = require('../model/rule');
const redisClient = require("../config/redis");
const AppError = require('../utils/AppError');

exports.createRule = async(req, res,next) => {
    try {

        const {
            endpoint, 
            method,
            limit,
            window,
            algorithm,
            capacity,
            refillRate
        } = req.body;

        if(req.apikey.owner.toString() !== req.user.id){
                return next(new AppError("You don't own this API key :",401));  
        }

        const rule = await Rule.create({
            apikey:req.apikey._id,
            endpoint,
            method,
            limit,
            window,
            algorithm,
            capacity,
            refillRate


        });
        res.status(200).json({
            status: "success",
            Data: rule
        })
        
    } catch (error) {
        next(error);
    }
}

exports.getallRules = async(req, res,next) => {

    try{

    if(req.apikey.owner.toString() !== req.user.id){
         return next(new AppError("You don't own this API key :",401));  

    }
        
    const allRules = await Rule.find({
        apikey:req.apikey._id
    });
    res.status(200).json({
        status: "Success",
        Rules: allRules
    })
    }catch(error){
        next(error);
    }
}

exports.updateRule = async(req, res,next) => {
    try {
        const { id } = req.params;

        if(req.apikey.owner.toString() !== req.user.id){
             return next(new AppError("You don't own this API key :",401));  

        }

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
        next(error);
    }
}

exports.DeleteRule = async(req, res,next) => {
    try {
        const { id } = req.params;

        if(req.apikey.owner.toString() !== req.user.id){
             return next(new AppError("You don't own this API key :",401));  

        }

        const deletetask = await Rule.findOneAndDelete({
    _id:id,
    apikey:req.apikey._id
});

        if(!deletetask){
            return next(new AppError("the thing u are trying to delte doesn't exit",404));
        }

        const key = `rule:${deletetask.apikey}:${deletetask.endpoint}:${deletetask.method}`;
        await redisClient.del(key);

        res.status(200).json({
            status: "Success"
        })
    } catch (error) {
       next(error);
    }
}

