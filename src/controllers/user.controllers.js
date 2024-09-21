import asyncHandler from "../../utils/asynchandler.js";
import apiError from "../../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../../utils/cloudinary.js"
import apiResponse from "../../utils/apiResponse.js";


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
   if(!username || !email){
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
    return res.status(200).clearCookie("accessToken",options,refreshToken).json(new apiResponse(200,{},"user logged out"))
       
  })

export {registerUser,loginUser,logOutUser};