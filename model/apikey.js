const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "revoked"],
        default: "active"
    },
    lastUsed:{
        type:Date
    },
    requestCount:{
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ApiKey', apiKeySchema);