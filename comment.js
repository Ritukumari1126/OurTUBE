const express = require('express')
const Router = express.Router()
const Comment = require('../models/Comment')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const checkAuth = require('../middleware/checkAuth')

Router.post('/new-comment/:videoId',checkAuth,async(req,res)=>{
    try{
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'ritu classes 123')
        const newComment = new Comment({
            _id:new mongoose.Types.ObjectId,
            videoId:req.params.videoId,
            user_id:verifiedUser._id,
            commentText:req.body.commentText
        })
    }
    catch(err){
        return res.Status(500).json({
            error:err
        })
    }
})

module.exports = Router

