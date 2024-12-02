import mongoose,{Schema} from "mongoose";

const playlistSchema = new Schema({

    title: {
        type: String,
        required: true,
        index: true
    },
    ownedby:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    description: {
        type: String
    },
    songs: [{
        type: Schema.Types.ObjectId,
        ref: "Song"
    }],
    follow: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const Playlist = mongoose.model("Playlist", playlistSchema)

export default Playlist;

//https://www.npmjs.com/package/mongoose-aggregate-paginate-v2