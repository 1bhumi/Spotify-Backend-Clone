import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import AsyncHandler from "../utils/AsyncHandler.js"
import Song from "../models/songs.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import User from "../models/user.model.js"

//song upload by artist
const uploadSong = AsyncHandler( async (req,res) => {

    const {title, uploadedby, duration} = req.body
    const {song, songimage}=  req.file

    if(!title || title?.trim() === ""){
        return res.status(400).json(new ApiError(400, "Title cannot be empty!!"))
    }

    if(!uploadedby || uploadedby?.trim() === ""){
        return res.status(400).json(new ApiError(400, "Artist Name cannot be empty!!"))
    }

    if(!duration || typeof duration !== "number" || duration < 0 ){
        return res.status(400).json(new ApiError(400, "Duration must not be empty and negative number!!"))
    }

    if(!song) {
        return res.status(400).json(new ApiError(400, "Song File is required!!"))
    }

    if(!songimage){
        return res .status(400) .json(new ApiError(400, "Song Image is required!!"))
    }

    console.log(`song details:: ${song}`)
    console.log(`song image:: ${songimage}`)

    const songURL = await uploadOnCloudinary(song?.path, "video")
    const songImageURL = await uploadOnCloudinary(songimage?.path, "image")

    if(!songURL) {
        return res.status(500).json(new ApiError(500, "Something went wrong while uploading the song!"))
    }
    console.log(`song URL details:: ${songURL}`)

    if(!songImageURL) {
        return res.status(500).json(new ApiError(500, "Something went wrong while uploading the song image!"))
    }

    const songDocument = await Song.create({
        title: title?.trim(),
        uploadedby: uploadedby?.trim(),
        duration: Number(duration),
        songimage: songImageURL.secure_url,
        song: songURL.secure_url
    })
    
    const checkSongDocument = await Song.findById(songDocument._id)
    console.log(checkSongDocument)

    if(!checkSongDocument){
        return res.status(500).json(new ApiError(500, "Something went wrong while creating the song's document!"))
    }

    const user = await User.findById(req.user._id).select("-password -refreshToken")

    user.songCount += 1
    await user.save({ ValidateBeforeSave: false })

    return res
       .status(201)
       .json(
            new ApiResponse(
                200,
                checkSongDocument,
                "Song uploaded successfully!!"
            )
        )
})

const getSongById = AsyncHandler( async (req, res) => {
    const {id} = req.body
    
    const song = await Song.findById(id)

    if(!song){
        return res.status(404).json(new ApiError(404, "Song not found!!"))
    }

    return res.status(200).json(new ApiResponse(200, song, "Song!!"))

})
//update title, song image
const editSong = AsyncHandler ( async (req,res) => {
    const {title, duration } = req.body
    const {songimage, song} = req.files

    if(title && title?.trim()=== ""){
        return res.status(400).json(new ApiError(400, "Title cannot be empty!!"))
    }
    if(duration && typeof duration !== "number" && duration < 0 ){
        return res.status(400).json(new ApiError(400, "Duration must not be empty and negative number!!"))
    }
    if(song && !song){
        return res.status(400).json(new ApiError(400, "Song File is required!!")) 
    }
    if(songimage && !songimage){
        return res.status(400).json(new ApiError(400, "Song Image is required!!"))
    }

    const songURL = await uploadOnCloudinary(song?.path, "video")
    const songImageURL = await uploadOnCloudinary(songimage?.path, "image")

    const updatedata = await Song.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                title: title?.trim(),
                duration: duration,
                song: songURL,
                songimage: songImageURL
            }
        },
        {
            new: true
        }
    )

    if(!updatedata){
        return res.status(400).json(new ApiError(400, "Something went wrong while updating the song info!"))
    }

    return res
       .status(200)
       .json(
            new ApiResponse(
                200,
                updatedata,
                "Song info updated successfully!!"
            )
        )
})

const deleteSong = AsyncHandler( async (req,res) => {
    const {id} = req.params
    
    const song = await Song.findByIdAndDelete(id)
    
    if(!song){
        return res.status(404).json(new ApiError(404, "Song not found!!"))
    }

    return res.status(200).json(new ApiResponse(200, {}, "Song deleted successfully!!"))
})

//get user id and get all song list
const getAllSong = AsyncHandler( async (req, res) => {
    
    const songs = await Song.find({}).populate("uploadedby", "username")
    if(!songs){
        return res.status(400).json(new ApiError(400, "No songs found!"))
    }
    return res
    .status(200)
    .json(new ApiResponse(200, songs, "All songs fetched successfully!!"))

})

const getSongByTitle = AsyncHandler( async (req, res) => {
    const {title} = req.params

    const songs = await Song.find({title})

    if(!songs){
        return res.status(400).json(new ApiError(400, `${title} songs not found`))
    }
    return res
    .status(200)
    .json(new ApiResponse(200, songs, `${title} songs fetched successfully!!`))

})

const likeSong = AsyncHandler ( async (req,res) => {
    const {songID} = req.params
    const userID = req.user._id;

    const song = await Song.findById(songID)

    if(!song){
        return res.status(404).json(new ApiError(404, "Song not found!!"))
    }
    song.like = !song.like
    await song.save({validateBeforeSave: false})

    const user = await User.findById(userID);
    if (!user) return res.status(404).json(new ApiError(404, "User not found!!"));

    if (song.like) {
        user.likedSongCount += 1
    }

    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            song,
            song.like? "Song liked successfully!!" : "Song disliked successfully!!"
        )
    )
})

const getLikedSongList = AsyncHandler( async (req,res) => {

    const song = await Song.find({like: true})
    if(!song || song.length===0){
        return res.status(404).json(new ApiError(400, "You haven't liked any song yet!!"))
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            song,
            "Liked songs fetched successfully!!"
        )
    )

})


export {
    uploadSong,
    getSongById,
    editSong,
    deleteSong,
    getAllSong,
    getSongByTitle,
    likeSong,
    getLikedSongList
}