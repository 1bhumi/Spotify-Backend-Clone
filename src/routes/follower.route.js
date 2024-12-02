import {Router} from "express"
import {follow, unfollow, getFollowersList} from "../controllers/follower.controller.js"
import authentication from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authentication)
router.route("/follow").post(follow)
router.route("/unfollow").post(unfollow)
router.route("/list").get(getFollowersList)



export default router



