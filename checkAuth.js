const jwt = require('jsonwebtoken');

module.exports = async(req,res,next)=>{
    try{
        console.log(req.headers.authorization.split(" ")[1]);
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'ritu classes 123')
        next();
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            error  : "invald token"
            
            
        })
    }
}