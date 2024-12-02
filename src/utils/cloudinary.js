import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config(); //load environment variables from.env file

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath, resourcetype) => {
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {resource_type: resourcetype})
        fs.unlinkSync(localFilePath) //remove the uploaded file from local storage after successful upload to cloudinary
        return response //this response will give us a url
    } catch (error) {
        return error
    }
}

export default uploadOnCloudinary;