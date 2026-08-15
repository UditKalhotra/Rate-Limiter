const User = require("../model/user");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");


exports.signup = async(req, res,next) => {
    try {

        const user = await User.create(req.body);

        res.status(201).json({

            message:"User created successfully",

            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }

        })
        
    } catch (error) {
        next(error);
    }
};

exports.login = async(req, res,next)=>{
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            return next(new AppError("The user u are trying to find doesn't exit",404));
        }

        const isMatch = await user.comparePassword(password);

        if(!isMatch){
            return next(new AppError("invalid Email and Password",404));
        }

        const token = jwt.sign(
            {
                id:user._id,
                role:user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "2h"
            }
        );

        res.status(200).json({
            message:"Login successful",
            token

        }); 

    } catch (error) {

        next(error);

    }
}