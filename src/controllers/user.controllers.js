import asyncHandler from "../../utils/asynchandler.js";
import apiError from "../../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../../utils/cloudinary.js"
import apiResponse from "../../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";



const generateAccessAndRefreshToken = async(userid)=>{
  try {
    const user = await User.findById(userid)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave:false})

 return {accessToken,refreshToken}

  } catch (error) {
    throw new apiError(500,error)
  }

}
const registerUser = asyncHandler(async(req,res)=>{
  // get user details from fronted
  // validation -not empty
  // check if user already exits: username,email
  // check for images,checks for avatar
  // upload them to cloudinary,avatar
  // create user object-create entry in db
  // remove password and reference token field from response
  //check for user creation
  // return res

  const{fullname,email,username,password} = req.body
  console.log("email:",email);
  console.log("fullname:",fullname);
  console.log("username:",username);
  console.log("password:",password);
  
  if ([ 
    fullname,email,username,password
  ].some((sam)=>sam?.trim()==="")) {
    throw new apiError(400,"all field are required")
    
  } 
  const exitedUser = await User.findOne({
    $or:[{username},{email}]
  })
  if (exitedUser) {
    throw new apiError(409,"user already logedin")
  }

  //console.log(req.files);
  
  const avatarLocalpath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalpath) {
    throw new apiError(400, "Avatar image is required.");
  }
    //console.log("Avatar Local Path:", avatarLocalpath);


  let coverImageLocalpath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
    coverImageLocalpath = req.files.coverImage[0].
    path
    
  }


const avatar = await uploadOnCloudinary(avatarLocalpath)
//console.log(avatar);

const coverImage = await uploadOnCloudinary(coverImageLocalpath)

if (!avatar) {
  throw new apiError(400,"avatar is compulsary")
}
 const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username
  })
const createdUser = await   User.findById(user._id).select(
  "-password -refreshToken"
 
  
)

  if (!createdUser) {
    throw new apiError(500,"something went wrong")
  }
  return res.status(201).json(
    new apiResponse(200,createdUser,"user registered successfully")
  )
  
  })

const loginUser = asyncHandler(async (req,res) =>{
  //req body -> data
  //username or email
  //find user
  //password check
  //access and refresh token
  //send cookie

  const {email,username,password} = req.body
   if(!username && !email){
    throw new apiError(400,"username or email required")
   }

   const user = await User.findOne({
    $or:[{username},{email}]   })
 if (!user) {
  throw new apiError(404,"user is not valid")
 }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
      throw new apiError(401,"password incorrect")
     }
const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id) 

    const loggedInUser = await User.findById(user._id).select(
      "-password  -refreshToken"
    )
    const options = {
      httpOnly:true,
      secure:true
    }

    return res.status(200).
    cookie('accessToken',accessToken,options).
    cookie('refreshToken',refreshToken,options).
    json(
      new apiResponse(
        200,{
          User:loggedInUser,accessToken,refreshToken
        },
        "user logged in successfully"
      )
    )
    
  })

  const logOutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
      req.user._id,{
        $set: {
          refreshToken:undefined
            }},
            {
              new:true
            }

    )
    const options = {
      httpOnly:true,
      secure:true
    }
    return res.status(200).clearCookie("accessToken",options).
    clearCookie("refreshToken",options).json(new apiResponse(200,{},"user logged out"))
       
  })
  const accessRefreshToken = asyncHandler(async(req,res)=>{
  const incomingRefreshtoken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshtoken) {
    throw new apiError(401,"unathorized req.")
  }
try {
    const decodedToken = jwt.verify(incomingRefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id)
    if (!user) {
      throw new apiError(401,"invalid refresh token")
    }
    if (!incomingRefreshtoken !== user?.refreshToken) {
      throw new apiError(401,"Refresh token is used and expired")
  
    }
    const options = {
      httpOnly:true,
      secure:true
    }
    const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    return res.status(200).cookie('accessToken',accessToken,options).
    cookie('refreshToken',newRefreshToken,options).
    json(
      new apiResponse(200,
        {accessToken,newRefreshToken},
        "access token refreshed"
      )
    )
} catch (error) {
  throw new apiError(401,error?.message)
}

  })


  const changeCurrentPassword = asyncHandler(async(req,res)=>{
       const {oldPassword,newPassWord} = req.body
       const user =await User.findById(req.user?._id)
      const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
      if(!isPasswordCorrect){
        throw new apiError(400,"invalid password")
      }
      user.password = newPassWord
      await user.save({validateBeforeSave:false})

      return res.status(200).json(new apiResponse(200,{},"password changed successfully"))

  })
  const getcurrentUser = asyncHandler(async(req,res)=>{
      return res.status(200).json(
        200,req.user,"current user fetched successfully"
      )
  })
  const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {username,fullname} = req.body

    if (!fullname || !username) {
      throw new apiError(400,"all field are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{
      $set:{
        fullname,username
      }
    },{
        new:true
      }).select("-password")

      return res.status(200).json(
        new apiResponse(200,user,"account update successfully")
      )



  })

  const updateAvatar = asyncHandler(async(req,res)=>{
const avatarLocalpath = req.file?.path
if (!avatarLocalpath) {
  throw new apiError(400,"avatar file is missing")
  
}


const avatar = await uploadOnCloudinary(avatarLocalpath)
if (!avatar.url) {
  throw new apiError(400,"error while uploading on avatar")
}

  const user = await User.findByIdAndUpdate(req.user?._id,{
    $set:{
       avatar:avatar.url
    }
  },{
    new:true
  }).select("-password")

  return res.status(200).json(
    200,user,"avatar uploaded successfully"
  )

  })

  const getUserchannelProfile = asyncHandler(async(req,res)=>{

  const{username} = req.params
  if (!username?.trim()) {
    throw new apiError(400,"username is missing")
    
  }
const channel = User.aggregate([{
   $match:{
    username: username?.lowerCase()
   }
},{
  $lookup:{
    from:"Subscription",
    localField:"_id",
    foreignField:"channel",
    as:"subscribers",
  }

},
{
  $lookup:{
    from:"Subscription",
    localField:"_id",
    foreignField:"subscriber",
    as:"subscribedTo",
  }
},
{
  $addFields:{
         subscriberCount:{
          $size:"$subscribers"
         },
         channelIsSubscribeCount:{
            $size:"$subscribedTo"
         },
         isSubscribed:{
          $cond:{
            if:{$in: [req.user?._id,"$subscribers.subscriber"]},
            then:true,
            then:true,
            else:false
          }
         }
  }
},
   {
    $project:{
      fullname:1,
      username:1,
      subscriberCount:1,
      channelIsSubscribeCount:1,
      isSubscribed:1,
      avatar:1,
      email:1

    }
   }
     
])

if (!channel?.length) {
  throw new apiError(404,"channel does not exit")
}
   return res.status(200).json(
    new apiResponse(200,channel[0],'User channel fetch successfully')
   )  


  })
  
const getWatchHistory = asyncHandler(async(req,res)=>{
  const user = await User.aggregate([
    {
      $match:{_id:mongoose.Types.ObjectId(req.user._id)}
    },
    {$lookup:{
      from:"Videos",
      localField:"watchHistory",
      foreignField:"_id",
      as:"watch-history",
      pipeline:[
        {
          $lookup:{
            from:"user",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:[
              {
                $project:{
                  fullname: 1,
                  username:1,
                  avatar:1
                }
              },
              {
                $addFields:{
                  ownner:{
                    $first:"$owner"
                  }
                }
              }
            ]
          }
        }
      ]
    }}
  ])  

  return res.status(200).json(
    new apiResponse(200,user[0].watchHistory,"watch history fetch succeddfully")
  )
})
  
export {registerUser,loginUser,logOutUser,
  accessRefreshToken,getcurrentUser,changeCurrentPassword,
changeCurrentPassword,updateAvatar,
getUserchannelProfile,updateAccountDetails,getWatchHistory 

};