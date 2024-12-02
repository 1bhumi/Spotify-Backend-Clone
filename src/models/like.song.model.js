import mongoose, {Schema} from "mongoose";

const likedSongSchema = new Schema({

    song: {
        type: Schema.Types.ObjectId,
        ref: "Song"
    },
    likedby: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    artist: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    like: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const LikedSong = mongoose.model("LikedSong", likedSongSchema);

export default LikedSong;