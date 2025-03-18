const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    user_id:{type:mongoose.Schema.Types.ObjectId, required :true,ref:'USER'},
    videoId:{type:String,require:true},
    commentText:{type:String,require:true}
},{timestamps:true})

module.exports = mongoose.model('Comment',commentSchema);