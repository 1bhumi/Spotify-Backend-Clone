import Router from "express"
import { signup, login, logout, checkOTP, updateUsername, updatePassword, updateEmail, updatePhone, updateCountry,
totalFollowers, totalFollowings, totalUploadedSong, totalLikedSongCount } from "../controllers/user.controller.js";
import authentication from "../middlewares/auth.middleware.js"

const router = new Router()

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/logout").post(authentication, logout)
router.route("/checkotp").post(checkOTP)

router.route("/update/username").patch(authentication, updateUsername)
router.route("/update/password").patch(authentication, updatePassword)
router.route("/update/email").patch(authentication, updateEmail)
router.route("/update/phone").patch(authentication, updatePhone)
router.route("/update/country").patch(authentication, updateCountry)

router.route("/totalfollower").get(authentication, totalFollowers) 
router.route("/totalfollowing").get(authentication, totalFollowings)
router.route("/totaluploadedsong").get(authentication, totalUploadedSong)
router.route("/totallikedsong").get(authentication, totalLikedSongCount)


export default router