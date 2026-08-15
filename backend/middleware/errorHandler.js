const errorHandler = (err, req, res, next) => {
    // jwt.verify() throws these directly — they don't have statusCode set,
    // so without this they'd fall through to a generic 500.
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            status: "fail",
            code: "TOKEN_EXPIRED",
            message: "Your session has expired. Please log in again."
        });
    }
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            status: "fail",
            code: "TOKEN_INVALID",
            message: "Invalid session. Please log in again."
        });
    }

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
}

module.exports = errorHandler;