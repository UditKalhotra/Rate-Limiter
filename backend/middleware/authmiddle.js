const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

exports.protect = async(req, res, next) => {

    try{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){

        return next(new AppError("No token Provided",401));

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
    next(error);
}
}

exports.restrictTo = (...role)=>{
    return (req, res, next)=>{
        if(!role.includes(req.user.role)){
            return next(new AppError("You don't have permission to access this resource :",403));
        }
        next();
    }
}