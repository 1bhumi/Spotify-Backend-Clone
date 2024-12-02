import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import Follower from "../models/follower.model.js";
import User from "../models/user.model.js";

const follow = AsyncHandler ( async (req,res) =>{

    const {followedto} = req.body
    const followedby = req.user._id

    const user = await User.findById(req.user._id).select("-password -refreshToken")



    const existedFollow = await Follower.findOne({
        $and: [{followedto: followedto}, {followedby: followedby}]
    })

    if(existedFollow){
        if(existedFollow.follow){
            return res.status(200).json(new ApiResponse(200,{}, "You are already following this user!"))
        }else{
            existedFollow.follow = true
            await existedFollow.save()
            return res.status(200).json(new ApiResponse(200,{}, `You are now following the user/artist with ID: ${followedto}`))
        }
    }
        const newfollow = await Follower.create({
            followedto: followedto,
            followedby: followedby,
            follow: true
        })


        user.followingCount += 1
        await user.save({validateBeforeSave: false})

     return res.status(200).json(new ApiResponse(200,{status: newfollow.follow}, `You are now following the user/artist with ID: ${followedto}`))


})

const unfollow = AsyncHandler (async (req,res) =>{

    const {followedto} = req.body
    const followedby = req.user._id

    const existedFollow = await Follower.findOne({
        $and: [{followedto: followedto}, {followedby: followedby}]        
    })

    if(existedFollow && existedFollow.follow){
        existedFollow.follow = false
        await existedFollow.save({validateBeforeSave: false})
        return res.status(200).json(new ApiResponse(200, `You are no longer following the user/artist with ID: ${followedto}`))
    }else{
        return res.status(400).json(new ApiResponse(400, "You are not following this user!"))
    }
})

const getFollowersList = AsyncHandler (async (req,res) =>{

    const followerlist = await Follower.find({followedto: req.user._id})
    if(!followerlist){
        return res .status(400) .json(new ApiError(400, "No one is following you"))
    }

    return res.status(200).json(new ApiResponse(200,{followerlist}, `${req.user._id} Follower List!`))
    
   

})

const getFollowingList = AsyncHandler (async (req,res) =>{
    const followinglist = await Follower.find({followedby: req.user._id})
    if(!followinglist){
        return res.status(400).json(new ApiError(400, "You are not following anyone"))
    }

    return res .status(200) .json(new ApiResponse(200, {followinglist}, `${req.user._id} Following List!`))

})

export {
    follow,
    unfollow,
    getFollowersList,
    getFollowingList,
 } 
  // Exporting functions for use in other files. 
  // This is a best practice for keeping code organized. 
  // It's also good for reusability. 
  // For example, you can import these functions in your playlist.controller.js file. 
  // This will allow you to reuse the follow, unfollow, getFollowersList, and
  // getFollowingList functions in your playlist.controller.js file. 
  // This way, you can avoid code duplication and maintainability.  
  // This also makes it easier for other developers to understand what your code does. 
  // It's also a good practice for when you're working in a team. 
  // If you have multiple developers working on the same codebase,
  // it's easier for them to collaborate and understand each other's code.
  // It's also good for when you're working on a large codebase. 
  // If you have a large codebase, it's easier for
