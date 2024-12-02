import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinaryConfig";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "Spotify_Images",
        resource_type: "auto"
    }
})

const upload = multer({storage: storage})

export default upload;