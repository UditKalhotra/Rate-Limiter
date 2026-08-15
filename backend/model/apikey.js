const mongoose = require('mongoose');
const user = require('./user');

const apiKeySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // SHA-256 digest of the raw key — used for fast O(1) auth lookups.
    keyHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // AES-256-GCM encrypted raw key — decrypted on demand so the owner
    // can view the original key again from the dashboard.
    keyEncrypted: {
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