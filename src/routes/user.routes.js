import { Router } from "express";
import {registerUser,loginUser, logOutUser, accessRefreshToken, changeCurrentPassword, getcurrentUser, updateAccountDetails, updateAvatar, getUserchannelProfile, getWatchHistory} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
     {
        name:"avatar",
        maxCount:1
     },
     {
      name:"coverImage",
      maxCount:1
     }
    ]),
    registerUser)
//yrouter.route("/login").post(login)
router.route("/login").post(loginUser)

//secure routes
router.route("/logout").post(verifyJWT,logOutUser)
router.route("/refresh-Token").post(accessRefreshToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getcurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)

router.route("/c/:username").get(verifyJWT,getUserchannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)

export default router;