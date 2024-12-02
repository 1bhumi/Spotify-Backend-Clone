import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authentication = async (req,res,next) =>{
   try {
     const token = req.cookies?.access_token
 
     if(!token){
         return res 
         .status(400) 
         .json(new ApiError(400, "Login session is expired!"))
     }
     //we will decode our aceesstoken which we have stored in the cookies and then we will decode
     //it with access secret key in env file
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN)
 
     //finding user by id to get user data and store user data in "user variable"
     const user = await User.findById(decodedToken._id).select("-password -refreshToken")
 
     //now we will store this user that fetched with id in the request object
     req.user = user //we added this user property to the request object
     
 
     next()
   } catch (error) {
    return res .status(400) .json(new ApiError(400, `Auth.middleware.js :: authentication :: ERROR : ${error?.message}`))
   }
}

export default authentication;