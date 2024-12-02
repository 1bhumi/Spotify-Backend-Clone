import mongoose, {Schema} from "mongoose"

const playlistfollowerSchema = new Schema({
    playlist: {
        type: Schema.Types.ObjectId,
        ref: "Playlist"
    },
    followedby: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    follow: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const PlaylistFollower = mongoose.model("PlaylistFollower", playlistfollowerSchema)

export default PlaylistFollower;