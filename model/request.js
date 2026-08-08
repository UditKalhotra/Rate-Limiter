const mongoose = require('mongoose');
const apikey = require('./apikey');

const requestLogSchema = new mongoose.Schema({
    apikey:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ApiKey"
    },
    userID:{
        type:String
    },
    endpoint:{
        type:String,
        required:true
    },
    method:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["allowed", "blocked"],
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model("requestLog", requestLogSchema);