import mongoose, {Schema} from "mongoose";

const songSchema = new Schema({
    title: {
        type: String,
        required: true,
        index: true
    },
    uploadedby: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    duration: {
        type: Number,
        required: true
    },
    songimage: {
        type: String //cloundinary
    },
    song: {
        type: String, //cloundinary
        required: true,
    },
    like: {
        type: Boolean,
        default: false,
    }
    
}, {timeStamps: true})

const Song = mongoose.model("Song", songSchema);

export default Song;