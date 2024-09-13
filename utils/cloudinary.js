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
                resource_type: "auto"
              });
          
              // File uploaded successfully
              console.log(response.url);
              return response;
              
            } catch (error) {
                fs.unlinkSync(localFilePath)  //remove the locally saved temporary file as the upload opeartion failed
                return null;
            }
          };
                  


  export default uploadOnCloudinary