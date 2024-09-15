import { Router } from "express";
import registerUser from "../controllers/user.controllers.js";

const router = Router()

router.route("/register").post(registerUser)
//yrouter.route("/login").post(login)

export default router;