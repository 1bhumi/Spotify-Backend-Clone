import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import Playlist from "../models/playlist.model.js";

const createPlaylist = AsyncHandler(async(req,res)=>{

    const {title,description} = req.body

    if(!title){
        return res .status(400) .json(new ApiError(400, "Please Enter a Playlist Name!!"))
    }

    if(!title?.trim()){
        return res .status(400) .json(new ApiError(400, "Playlist Name cannot be empty!!"))
    }



    const playlist = await Playlist.create({
        title: title?.trim(),
        ownedby: req.user._id,
        description: description && description?.trim(),
    })

    return res 
    .status(200)
    .json(
        new ApiResponse(200,{playlist}, "Playlist Created Successfully")
    )
})

//get all the playlist of current user
const getUserPlaylists = AsyncHandler(async(req,res)=>{

    const playlists = await Playlist.find({ownedby: req.user._id}).select("title")
    if(!playlists){
        return res .status(400) .json(new ApiError(400, "No Playlists found!"))
    }
    return res .status(200) .json(new ApiResponse(200, playlists, `${req.user.username}'s playlists`))

})

const addSong = AsyncHandler(async(req,res)=>{
    const {playlistID, songID} = req.body
    const addSong = await Playlist.findById(playlistID)
    if(!addSong){
        return res.status(400).json(new ApiError(400, "No Playlist found!!"))
    }

    if(addSong.songs.includes(songID)){
        return res.status(400).json(new ApiError(400, "Song already exists in the playlist!!"))
    }

    addSong.songs.push(songID)
    await addSong.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, addSong, "Song added successfully to the playlist"))

}) 

const deleteSong = AsyncHandler(async(req,res)=>{
    const {playlistID, songID} = req.body
    const deleteSong = await Playlist.findById(playlistID)
    if(!deleteSong){
        return res.status(400).json(new ApiError(400, "No Playlist found!!"))
    }

    if(!deleteSong.songs.includes(songID)){
        return res.status(400).json(new ApiError(400, "Song not found in the playlist!!"))
    }

    deleteSong.songs.pull(songID)
    await deleteSong.save({validateBeforeSave: false})

    return res.status(200)
    .json(
        new ApiResponse(200, deleteSong, "Song deleted successfully from the playlist"
        )
    )

})

const editPlaylist = AsyncHandler(async(req,res)=>{
    const {title,description} = req.body
    const id = req.user._id

    if(!title){
        return res.status(400).json(new ApiError(400, "Please Enter a Playlist Name!!"))
    }
    if(!title?.trim()){
        return res.status(400).json(new ApiError(400, "Playlist Name cannot be empty!!"))
    }
  
     const playlist = await Playlist.findByIdAndUpdate(
        id,
        {
            $or:{
                title: title?.trim(),
                description: description && description?.trim()
            }
        },
        {
            new: true
        }
     ).select("-password -resfreshToken")

     return res.status(200).json(new ApiResponse(200, {playlist}, "Playlist Updated Successfully"))
})

const deletePlaylist = AsyncHandler(async(req,res)=>{
    const {playlistID} = req.body

    const playlist = await Playlist.findByIdAndDelete(playlistID)
    if(!playlist){
        return res.status(400).json(new ApiError(400, "No Playlist found!!"))
    }

    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted Successfully!!"))

})

//get playlist by title name with all details like songs list , creator name etc 
const getPlaylistByTitle = AsyncHandler(async(req,res)=>{
    const {title} = req.body

    const playlist = await Playlist.find({title})
    if(!playlist){
        return res.status(400).json(new ApiError(400, `${title} Playlist not found`))
    }
    return res.status(200).json(new ApiResponse(200, {playlist}, `${title} Playlist`))

})

const followPlaylist = AsyncHandler ( async (req,res) => {
    const {playlistID} = req.params

    const playlist = await Playlist.findById(playlistID)

    if(!playlist){
        return res.status(404).json(new ApiError(404, "Song not found!!"))
    }
    playlist.follow = !playlist.follow
    await playlist.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            playlist.follow? "Playlist followed successfully!!" : "Playlist unfollowed successfully!!"
        )
    )
})



export {
    createPlaylist,
    getUserPlaylists,
    addSong,
    deleteSong,
    editPlaylist,
    deletePlaylist,
    getPlaylistByTitle,
    followPlaylist
}