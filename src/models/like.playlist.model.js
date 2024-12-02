import mongoose, {Schema} from "mongoose";

const likedplaylistSchema = new Schema({

    playlist: {
        type: Schema.Types.ObjectId,
        ref: "Playlist"
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    like: {
        type: Boolean,
        default: false
    }
}, {timeStamps: true})

const LikedPlaylist = mongoose.model("LikedPlaylist", likedplaylistSchema);

export default LikedPlaylist;