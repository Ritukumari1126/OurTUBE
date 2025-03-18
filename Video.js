const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    title:{type:String,require:true},
    description:{type:String,require:true},
    user_id:{type:mongoose.Schema.Types.ObjectId, required :true,ref:'USER'},
    videoUrl:{type:String,require:true},
    videoId:{type:String,require:true},
    thumbnailUrl:{type:String,require:true},
    thumbnailId:{type:String,require:true},
    category:{type:String,require:true},
    tags:[{type:String}],
    likes:{type:Number,require:true,default:0},
    dislike:{type:Number,require:true,default:0},
    views:{type:Number,default:0},
    likedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'USER'}],
    dislikedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'USER'}],
    viewedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'USER'}]


},{timestamps:true})

module.exports = mongoose.model('Video',videoSchema);