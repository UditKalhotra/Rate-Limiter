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
        type:Number,
        required:true
    },
    window:{
        type:Number,
        required:true
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Rule",ruleSchema);