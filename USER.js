const mongoose = require('mongoose')


const USERSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    channelName:{type:String,require:true},
    email:{type:String,require:true},
    phone:{type:String,require:true},
    password:{type:String,require:true},
    logoUrl:{type:String,require:true},
    logoId:{type:String,require:true},
    subscribers:{type:Number,default:0},
    subscribedBY:[{type:mongoose.Schema.Types.ObjectId,ref:'USER'}],
    subscribedChannel:[{type:mongoose.Schema.Types.ObjectId,ref:'USER'}]
},{timestamps:true})

module.exports = mongoose.model('USER',USERSchema)