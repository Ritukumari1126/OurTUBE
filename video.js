const express = require('express')
const Router = express.Router();
const Video = require('../models/Video')
const checkAuth = require('../middleware/checkAuth')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const mongoose = require('mongoose')

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECREAT // Click 'View API Keys' above to copy your API secret
});

Router.post('/upload',checkAuth,async(req,res)=>{
    try{
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'ritu classes 123')
        console.log(verifiedUser)
        console.log(req.body)
        console.log(req.files.video)
        
        
       const uploadVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath,{
        resource_type:'video'
       })
       const uploadthumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
       console.log(uploadVideo)
       console.log(uploadthumbnail)
       console.log(req.files.thumbnail)

       const newVideo = new Video({
            _id: new mongoose.Types.ObjectId,
            title:req.body.title,
            description:req.body.description,
            user_id:verifiedUser._id,
            videoUrl:uploadVideo.secure_url,
            videoId:uploadVideo.public_id,
            thumbnailUrl:uploadthumbnail.secure_url,
            thumbnailId:uploadthumbnail.public_id,
            category:req.body.category,
            tags:req.body.tags.split(","),
            
       })

       const newUploadedVideo = await newVideo.save()
       res.status(200).json({
        newVideo:newUploadedVideo
       })

    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            error:err
        })

    }
})

//update video

Router.post('/update/:id',checkAuth,async(req,res)=>{
    try{
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'ritu classes 123')
        const video = await Video.findById(req.params.videoId)

        if(video.user_id == verifiedUser._id){
            if(req.files){
                await cloudinary.uploader.upload.destroy(video.thumbnailId)
                const updatedThumbnail = cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
                const updateData = {
                    title:req.body.title,
                    description:req.body.description,
                    category:req.body.category,
                    tags:req.body.tags.split(","),
                    thumbnailUrl:uploadthumbnail.secure_url,
                    thumbnailId:uploadthumbnail.public_id
                }

                const updatedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId,updateData)
                res.status(200).json({
                    upadatedVideo:updatedVideoDetail
                })

            }
            else{
                await cloudinary.uploader.upload.destroy(video.thumbnailId)
                const updatedThumbnail = cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
                const updateData = {
                    title:req.body.title,
                    description:req.body.description,
                    category:req.body.category,
                    tags:req.body.tags.split(","),
                    
                }

                const updatedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId,updateData)
                res.status(200).json({
                    upadatedVideo:updatedVideoDetail
                })

            }
        }
        else{
            return res.status(500).json({
                error:'you have no right'
            })
        }

    }
    catch(err){
        res.status(500).json({
            error:err
        })
    }
})

Router.get('/own-video',checkAuth,async(req,res)=>{
    try{
        const token = req.headers.authorization.split(" ")[1]
        const user = await jwt.verify(token,'ritu classes 123')
        console.log(user)
        const videos = await Video.find({user_id:user._id}).populate('user_id','channelName logoUrl')
        res.status(200).json({
            videos:videos
        })

    }

    catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

Router.delete('/delete/:id',checkAuth,async(req,res)=>{
    try{
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1] , 'ritu classes 123')
        const video = await Video.findById(req.params.videoId)
        if(video.user_id == verifiedUser._id){
            await cloudinary.uploader.destroy(video.videoId,{resource_type:'video'})
            await cloudinary.uploader.destroy(video.thumbnailId)
            const deleteResponse = await Video.findByIdAndDelete(req.params.videoId)
            res.status(200).json({
                deleteResponse:deleteResponse
            })
        }
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            error:err
        })
    }
})

Router.put('/like/:videoId',checkAuth,async(req,res)=>{
    try{
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'ritu classes 123')
        const video = await Video.findById(req.params.videoId)
        if(video.likedBy.includes(verifiedUser._id)){
            return res.status(500).json({
                error:'already liked'
            })
        }

        if(video.dislikedBy.includes(verifiedUser._id)){
            video.dislike -= 1;
            video.dislikedBy = video.dislikedBy.filter(userId=>userId.toString() != verifiedUser._id)
        }

        video.likes += 1;
        video.likedBy.push(verifiedUser._id)
        await video.save();

        res.status(200).json({
            msg:'liked'
        })
    }
    catch(err){
        return res.status(500).json({
            error:err
        })
    }
})

Router.put('/dislike/:videoId',checkAuth,async(req,res)=>{
    try{
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'ritu classes 123')
        const video = await Video.findById(req.params.videoId)
        if(video.dislikedBy.includes(verifiedUser._id)){
            return res.status(500).json({
                error:'already disliked'
            })
        }

        if(video.likedBy.includes(verifiedUser._id)){
            video.likes -= 1;
            video.likedBy = video.likedBy(userId => userId.toString() != verifiedUser._id)
        }

        video.dislike += 1;
        video.dislikedBy.push(verifiedUser._id)
        await video.save();

        res.status(200).json({
            msg:'disliked'
        })
    }
    catch(err){
        res.status(500).json({
            error:err
        })
    }
})

module.exports = Router
