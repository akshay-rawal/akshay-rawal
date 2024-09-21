import apiError from "../../utils/apiError";
import asyncHandler from "../../utils/asynchandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";



export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
      const token = req.cookie?.accessToken || req.header("authorization")?.replace("Bearer","")
  
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

