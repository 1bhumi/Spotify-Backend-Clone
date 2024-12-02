import mongoose, {Schema} from 'mongoose';

const playlistFollow = new Schema ({
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

const PlaylistFollow = mongoose.model("PlaylistFollow", playlistFollow)

export default PlaylistFollow;