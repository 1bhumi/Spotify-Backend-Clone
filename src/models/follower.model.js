import mongoose, {Schema} from "mongoose"

const followerSchema = new Schema({
    followedto: {
        type: Schema.Types.ObjectId,
        ref: "User"
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

const Follower = mongoose.model("Follower", followerSchema)

export default Follower;
