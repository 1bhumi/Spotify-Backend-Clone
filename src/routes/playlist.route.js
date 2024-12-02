import { Router } from "express"
import { createPlaylist, getUserPlaylists, addSong, deleteSong, editPlaylist, deletePlaylist, getPlaylistByTitle, followPlaylist } from "../controllers/playlist.controller.js"
import authentication from "../middlewares/auth.middleware.js";

const router = new Router();
router.use(authentication)
router.route("/playlist").post(createPlaylist)
router.route("/getUserPlaylist").get(getUserPlaylists)
router.route("/addSong").post(addSong)
router.route("/deleteSong").delete(deleteSong)
router.route("/editPlaylist").post(editPlaylist)
router.route("/deletePlaylist").delete(deletePlaylist)
router.route("/getPlaylists").get(getPlaylistByTitle)
router.route("/followPlaylist/:playlistID").post(followPlaylist)


export default router