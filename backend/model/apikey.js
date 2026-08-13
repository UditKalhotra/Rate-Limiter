const mongoose = require('mongoose');
const user = require('./user');

const apiKeySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
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
},{
    timestamps:true
});

module.exports = mongoose.model('ApiKey', apiKeySchema);