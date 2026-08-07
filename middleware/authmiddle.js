const jwt = require("jsonwebtoken");

exports.protect = async(req, res, next) => {

    try{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){

        return res.status(401).json({
            message:"No token provided"
        });

    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
}
catch(error){
    res.status(500).json({
        message: error.message
    })
}
}

exports.restrictTo = (...role)=>{
    return (req, res, next)=>{
        if(!role.includes(req.user.role)){
            return res.status(403).json({
                message: "You don't have permission to access this resource :"
            })
        }
        next();
    }
}