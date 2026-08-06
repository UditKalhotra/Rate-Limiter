const User = require("../model/user");
const jwt = require("jsonwebtoken");


exports.signup = async(req, res) => {
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
        res.status(400).json({
            message:error.message
        });
    }
};

exports.login = async(req, res)=>{
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            return res.status(401).json({
                message: "Invalid email and Password"
            })
        }

        const isMatch = await user.comparePassword(password);

        if(!isMatch){
            return res.status(401).json({
                message:"Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id:user._id,
                role:user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        );

        res.status(200).json({
            message:"Login successful",
            token

        }); 

    } catch (error) {

        res.status(500).json({
            message:error.message
        });

    }
}