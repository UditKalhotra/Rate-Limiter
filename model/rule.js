const mongoose = require('mongoose');
const apikey = require('./apikey');

const ruleSchema = new mongoose.Schema({
    
    apikey:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"apikey",
        required: true
    },
    endpoint:{
        type:String,
        required:true
    },
    method:{
        type:String,
        required:true,
        uppercase:true
    },
    limit:{
        type:Number
    },
    window:{
        type:Number
    },
    algorithm:{
        type:String,
        enum:[
            "sliding_window",
            "token_bucket"
        ],
        default:"sliding_window"
    },
    capacity:{
        type:Number
    },
    refillRate:{
        type:Number
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Rule",ruleSchema);