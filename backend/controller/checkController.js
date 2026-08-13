const checkLimit = require('../service/checkLimit');
const AppError = require('../utils/AppError');

exports.check = async (req, res,next) => {
    try {
        const { resource, method, clientId } = req.body;

        if (!resource || !method) {
            return next(new AppError("resource and method are required",400));
        }

        const result = await checkLimit({
            apikeyId: req.apikey._id,
            resource,
            method
        });

        if (result.error) {
            return res.status(403).json({ message: result.error });
        }

        res.status(result.allowed ? 200 : 429).json({
            allowed: result.allowed,
            remaining: result.remaining,
            reset: result.reset
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};