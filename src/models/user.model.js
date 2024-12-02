import mongoose, {Schema}from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";

const userSchema = new Schema ({

    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        index: true,
        minLength: 10,
        maxLength: 10
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female", "others"]
    },
    dob: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        index: true
    },
    artist: {
        type: Boolean,
        default: false
    },
    songCount: {
        type: Number,
        default: 0
    },
    followerCount: {
        type: Number,
        default: 0
    },
    followingCount: {
        type: Number,
        default: 0
    },
    refreshToken: {
        type: String
    },
    likedSong: [{
        type: Schema.Types.ObjectId,
        ref: "Song"
    }],
    otp: {
        type: String
    }

}, {timestamps: true})

userSchema.pre("save", async function(next){
    try {
        if(this.isModified("password")){
            this.password = await bcrypt.hash(this.password, 10)
        }else{
            next()
        }
    } catch (error) {
        console.log(error)
    }
})

userSchema.methods.comparePassword= async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            phone: this.phone
        },process.env.ACCESS_TOKEN,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },process.env.REFRESH_TOKEN,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


const User = mongoose.model("User", userSchema)

export default User;