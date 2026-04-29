import {Router} from "express"
import { register, login,getMe, logout,googleCallback} from "../controllers/auth.controller.js"
import { registerValidator, loginValidator} from "../validators/auth.validator.js"
import { authUser } from "../middleware/auth.middleware.js"
import passport from "../config/passport.js"


const authRouter = Router()

authRouter.post("/register",registerValidator,register)

authRouter.post("/login",loginValidator,login)

authRouter.get("/get-me",authUser,getMe)

authRouter.post("/logout",authUser,logout)

authRouter.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false,prompt:"select_account" })
)

authRouter.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    googleCallback
)

export default authRouter
