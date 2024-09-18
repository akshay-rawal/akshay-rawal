import {v2 as cloudinary} from "cloudinary"
import { response } from "express";
import fs from "fs"


    // Configuration
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const uploadOnCloudinary = async (localFilePath) => {
          try {
            if (!localFilePath) return null;
        
            // Upload the file to Cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
              resource_type: "auto", // Ensure this is set to auto to handle different file types
            });
        
            // File uploaded successfully
            //console.log("Cloudinary Upload Successful:", response.url);
            fs.unlinkSync(localFilePath)
            return response;
          } catch (error) {
            fs.unlinkSync(localFilePath);  // Remove the locally saved temporary file if upload fails
            return null;
          }
        };
        

  export default uploadOnCloudinary
