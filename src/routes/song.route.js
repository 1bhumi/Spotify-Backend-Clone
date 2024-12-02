import {Router } from "express"
import {uploadSong,getSongById,editSong,deleteSong,getAllSong,getSongByTitle,likeSong,getLikedSongList} from "../controllers/song.controller.js"
import upload from "../middlewares/multer.middleware.js";
import authentication from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authentication)
router.route("/upload").post(upload.fields([
    { name: "song", maxCount: 1 },
    { name: "songimage", maxCount: 1 }
]), uploadSong)
router.route("/getsong").get(getSongById)
router.route("/editsong/:id").patch(upload.fields([
    { name: "song", maxCount: 1 },
    { name: "songimage", maxCount: 1 }
]), editSong)

router.route("/delete/:id").delete(deleteSong)

router.route("/getAllSong").get(getAllSong)

router.route("/getByTitle/:title").get(getSongByTitle)

router.route("/likedSong/:songID").patch(likeSong)

router.route("/likedSongList").get(getLikedSongList)


export default router
