import apiError from "../../utils/apiError.js";
import asyncHandler from "../../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";



export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
     



      if(!token){
          new apiError(401,"unautorized request")
      }
  
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  const user = await User.findById(decodedToken?._id).select("-password, -refreshToken")
  
  if(!user){
    //TODO dicuss about frontend
    throw new  apiError(400,"user is not found")
  }
  
  req.user = user;
  next()
    } catch (error) {
      throw new apiError(401,error?.message)
    }
})

