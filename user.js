const express = require('express')
const Router = express.Router();
const USER = require('../models/USER')
const bcrypt = require('bcrypt')
const cloudinary = require('cloudinary').v2
require('dotenv').config()
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const checkAuth = require('../middleware/checkAuth');


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECREAT // Click 'View API Keys' above to copy your API secret
});

Router.post('/signup',async(req,res)=>{
    try
    {
        console.log('hello coder')
        const user = await USER.find({email:req.body.email})
        console.log('user',user)
        if(user.length>0){
            console.log("user is already here..")
            return res.status(500).json({
                error:'email is already registered'
            })
        }
        console.log("pass....")
        const uploadImage = await cloudinary.uploader.upload(req.files.logo.tempFilePath)
        console.log(uploadImage)
        const hash = await bcrypt.hash(req.body.password,10)
        const newUser = new USER({
            _id:new mongoose.Types.ObjectId,
            channelName:req.body.channelName,
            email:req.body.email,
            phone:req.body.phone,
            password:hash,
            logoUrl:uploadImage.secure_url,
            logoId:uploadImage.public_id
        })

        const users = await  newUser.save()
        res.status(200).json({
            newUser:users
        })


    }
    catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

//login api

Router.post('/login',async(req,res)=>{
    try{
        console.log('hello')
        console.log(req.body)
        const user = await USER.find({email:req.body.email})
        console.log(user)
        if(user.length == 0){
            return res.status(500).json({
                error:'email is not registered' 
            })
        }
        const isValid = await bcrypt.compare(req.body.password,user[0].password)

        if(isValid){
            const token = jwt.sign({
                _id:user[0]._id,
                channelName:user[0].channelName,
                email:user[0].email,
                logo:user[0].logoId
            },
        
        'ritu classes 123',
        {
            expiresIn:'365d'
        })

        res.status(200).json({
            _id:user[0]._id,
            channelName:user[0].channelName,
            email:user[0].email,
            phone:user[0].phone,
            password:user[0].password,
            logoUrl:user[0].logoUrl,
            logoId:user[0].logoId,
            token:token,
            subscribers:user[0].subscribers,
            subscribedChannel:user[0].subscribedChannel
        })
    }
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

Router.put('/subscriber/:userBid',checkAuth,async(req,res)=>{       // here userB ko subscribe krega userA .. userA login krega or uska id verify hoga
    try{
        const userA = await jwt.verify(req.headers.authorization.split(" ")[1], 'ritu classes 123')
        console.log(userA)
        const userB = await USER.findById(req.params.userBid)
        console.log(userB)
        if(userB.subscribedBY.includes(userA)){
            return res.status(500).json({
                msg:'already subscribed'
            })

        }

        userA.subscribers += 1;
        userA.subscribedBY.push(userA._id);
        await userB.save()
        const userAFULLinformation = await USER.findById(userA._id)
        userAFULLinformation.subscribedChannel.push(userB._id)
        await userAFULLinformation.save()
        res.status(200).json({
            mgs:'subscribed'
        })

    }
    catch(err){
        res.status(500).json({
            error:err
        })
    }
})

Router.put('/unsubscribe/:userBid',checkAuth,async(req,res)=>{
    try{
        const userA = await jwt.verify(req.headers.authorization.split(" ")[1],'ritu classes 123')
        const userB = await USER.findById(req.params.userBid)
        if(userB.subscribedBY.includes(userA._id)){
            userB.subscribers -= 1;
            userB.subscribedBY = userB.subscribedBY.filter(userId=> userId.toString() != userA._id)
            await userB.save()
            const userAFULLinformation =  await USER.findById(userA._id)
            userAFULLinformation.subscribedChannel.filter(user=> user.toString() != userA._id)
            await userA.save()
            
        }
        else{
            return res.status(500).json({
                msg:'not subscribed'
            })
        }
        await userB.save()
        const userAFULLinformation =  await USER.findById(userA._id)
        userAFULLinformation.subscribedChannel.filter(user=> user.toString() != userA._id)
        await userA.save()

        res.status(200).json({
            msg:'unsubscribed'
        })

    }
    catch(err){
        return res.status(500).json({
            error:err
        })
    }
})

Router.put('/views/:videoId',checkAuth,async(req,res)=>{
    try{
        const video = await Video.findById(req.params.videoId)
        console.log(video)
        video.views += 1;
        await video.save();
        res.status(200).json({
            msg:'ok'
        })

    }
    catch(err){
        return res.status(500).json({
            error:err
        })
    }
})

module.exports = Router;