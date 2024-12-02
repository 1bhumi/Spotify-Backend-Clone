import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import User from "../models/user.model.js";
import Follower from "../models/follower.model.js";
import Song from "../models/songs.model.js";
import LikedSong from "../models/like.song.model.js";
import nodeMailer from "../utils/nodeMailer.js";
import bcrypt from "bcrypt"
import moment from "moment"

const signup = AsyncHandler(async (req, res) => {

    //object distructuring
    const { username, email, phone, password, gender, dob, country } = req.body

    if (!username || !email || !phone || !password || !gender || !dob || !country) {
        return res.status(400).json(new ApiError(400, "All field are required!"))
    } //undefined checking

    if (username?.trim() === "") {
        return res.status(400).json(new ApiError(400, "First Name is required!"))
    }//empty string checking

    if (/([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/.test(email?.trim().toLowerCase()) === null) { //if exp is wrong it will return null
        return res.status(400).json(new ApiError(400, "invalid E-mail format!"))
    }

    if (String(phone)?.length !== 10) {
        return res.status(400).json(new ApiError(400, "Invalid Phone No.!"))
    }

    if (password?.trim().length < 10) {
        return res.status(400).json(new ApiError(400, "Password must be at least 10 character length!"))
    }

    const validGender = ["male", "female", "others"]
    if (!validGender?.includes(gender?.toLowerCase())) {
        return res.status(400).json(new ApiError(400, "Please enter a valid gender"))
    }

    //dob validation
    if (!dob || !moment(dob, "YYYY-MM-DD", true).isValid()) {
        return res.status(400).json(new ApiError(400, "Invalid Date of Birth!"))
    }

    //dob must be greater than 14
    const age = moment().diff(moment(dob, "YYYY-MM-DD"), 'year')
    if (age < 14) {
        return res.status(400).json(new ApiError(400, "You must be at least 14 years old to register!"))
    }

    //country validation
    if (!country?.trim()) {
        return res.status(400).json(new ApiError(400, "Please enter a country"))
    }

    const existedUser = await User.findOne({
        $or: [{ email: email?.trim().toLowerCase() }, { phone: String(phone)?.trim() }]
    })

    if (existedUser) {
        return res.status(400).json(new ApiError(400, "You have already registered!"))
    }

    const user = await User.create({
        username: username?.trim(),
        email: email?.trim().toLowerCase(),
        phone: String(phone)?.trim(),
        password: password?.trim(),
        gender: gender?.toLowerCase(),
        dob: dob?.trim(),
        country: country?.trim()
    })

    const isCreatedUser = await User.findById(user._id).select("-password -refreshToken")

    if (!isCreatedUser) {
        return res.status(400).json(new ApiError(500, "Something went wrong while creating the user's document!"))
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                isCreatedUser,
                "User successfully registered"
            )
        )
})

const generateOTP = () => {
    return Math.floor(Math.random() * 100000);
}

const login = AsyncHandler(async (req, res) => {
    const { data, password } = req.body

    if (!data) {
        return res.status(400).json(new ApiError(400, "Please enter your Email or Phone no!!"))
    }

    if (String(data)?.trim()?.length !== 10) {
        if (data?.includes("@")) {
            if (!/([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/.test(data?.trim().toLowerCase())) {
                return res.status(400).json(new ApiError(400, "Invalid Email format"))
            }
        } else {
            return res.status(400).json(new ApiError(400, "Phone number should be of 10 digits"));
        }
    }

    // if(!data &&!/([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/.test(data?.trim().toLowerCase())){
    //     return res .status(400) .json(new ApiError(400, "Invalid Email format"))
    // }

    if (password?.trim()?.length < 8) {
        return res.status(400).json(new ApiError(400, "Password should be at least 8 characters long"))
    }

    const ExistedUser = await User.findOne({
        $or: [{ email: data?.trim()?.toLowerCase() }, { phone: data?.trim() }]
    })

    // console.log(ExistedUser)

    if (!ExistedUser) {
        return res.status(400).json(new ApiError(404, "User not found"))
    }

    const checkPassword = await ExistedUser.comparePassword(password)
    if (!checkPassword) {
        return res.status(400).json(new ApiError(400, "Password is incorrect"))
    }

    const otp = generateOTP();
    nodeMailer.sendMail(ExistedUser.email, otp)

    ExistedUser.otp = otp
    await ExistedUser.save({ ValidateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Logged in Successfully!! Please enter your OTP!!")
        )
})

const logout = AsyncHandler(async (req, res) => {
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("access_token", options)
        .clearCookie("refresh_token", options)
        .json(
            new ApiResponse(
                200,
                "Logged out successfully"
            )
        )
})

const checkOTP = AsyncHandler(async (req, res) => {
    const { email, otp } = req.body

    if (!/([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/.test(email?.trim().toLowerCase())) {
        return res.status(400).json(new ApiError(400, "Invalid Email format"))
    }

    if (!otp?.trim()) {
        return res.status(400).json(new ApiError(400, "OTP is required"))
    }

    const user = await User.findOne({ email: email?.trim()?.toLowerCase() }).select("-password")
    if (!user) {
        return res.status(404).json(new ApiError(404, "User not found"))
    }

    if (otp !== user.otp) {
        return res.status(400).json(new ApiError(400, "Invalid OTP"))
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()


    user.refreshToken = refreshToken
    user.otp = undefined
    await user.save({ ValidateBeforeSave: false })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("access_token", accessToken, options)
        .cookie("refresh_token", refreshToken, options)
        .json(
            new ApiResponse(200, {}, "Login sucessfully!!")
        )

})

const updateUsername = AsyncHandler(async (req, res) => {
    const { username } = req.body

    if (!username) {
        return res.status(400).json(new ApiError(400, "Username is required"))
    }
    if (!username?.trim()) {
        return res.status(400).json(new ApiError(400, "Username can not be empty"))
    }

    const updateData = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { username: username?.trim() }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if (!updateData) {
        return res.status(404).json(new ApiError(404, "User not found"))
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updateData.username,
                "Username updated successfully"
            )
        )
})

const updatePassword = AsyncHandler(async (req, res) => {
    const { newPassword } = req.body

    if (!newPassword?.trim()) {
        return res.status(400).json(new ApiError(400, "Password can not be empty"))
    }
    if (!newPassword?.trim().length < 8) {
        return res.status(400).json(new ApiError(400, "Password should be of least 8 characters"))
    }

    const updatepassword = await User.findByIdAndUpdate(
        req.user._id,
    ).select("-password -refreshToken")

    const encodedPassword = await bcrypt.hash(newPassword, 10)
    updatepassword.password = encodedPassword
    await updatepassword.save({ ValidateBeforeSave: true })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password updated successfully"
            )
        )
})

const updateEmail = AsyncHandler(async (req, res) => {
    const { email } = req.body //text data only (file/files)

    if (!email) {
        return res.status(400).json(new ApiError("Email is required"))
    }
    if (!/([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/.test(email?.trim().toLowerCase())) {
        return res.status(400).json(new ApiError(400, "Invalid email"))
    }

    const userUpdatesEmail = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                email: email?.trim().toLowerCase()
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                userUpdatesEmail.email,
                "Email updated successfully"
            )
        )

})

const updatePhone = AsyncHandler(async (req, res) => {
    const { phone } = req.body

    if (!phone) {
        throw new ApiError(400, "Phone no is required")
    }

    if (String(phone)?.length !== 10) {
        throw new ApiError(400, "Invalid Phone No.!")
    }

    const updatedPhone = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                phone: String(phone)
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPhone.phone,
                "Mobile Updated Sucessfully"
            )
        )

})

const updateCountry = AsyncHandler(async (req, res) => {
    const { country } = req.body

    if (!country) {
        return res.status(400).json(new ApiError(400, "Country Name is required"))
    }
    if (!country?.trim()) {
        return res.status(400).json(new ApiError(400, "Country Name can not be empty"))
    }

    const updateCountry = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                country: country?.trim()
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updateCountry.country,
                "Country updated successfully"
            ))
})

const totalFollowers = AsyncHandler(async (req, res) => {

    const totalFollower = await Follower.countDocuments({ followedto: req.user._id });

    return res
        .status(200)
        .json(new ApiResponse(200, `You have ${totalFollower} Followers`));
});

const totalFollowings = AsyncHandler(async (req, res) => {

    const totalFollowing = await Follower.countDocuments({followedby: req.user._id})
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            `You are following ${totalFollowing} users`
        )
    )
})

const totalUploadedSong = AsyncHandler(async (req, res) => {

    const totalSong = await Song.countDocuments({uploadedby: req.user._id})

    return res
        .status(200)
        .json(
             new ApiResponse(
                 200,
                 `You have uploaded ${totalSong} songs`
             )
         )
})

const totalLikedSongCount = AsyncHandler(async (req, res) => {

    const totalsong = await LikedSong.countDocuments({likedby: req.user._id})

    return res
       .status(200)
       .json(
             new ApiResponse(
                 200,
                 `You have liked ${totalsong} songs`
             )
         )
})



export {
    signup,
    login,
    logout,
    checkOTP,
    updateUsername,
    updatePassword,
    updateEmail,
    updatePhone,
    updateCountry,
    totalFollowers,
    totalFollowings,
    totalUploadedSong,
    totalLikedSongCount
}