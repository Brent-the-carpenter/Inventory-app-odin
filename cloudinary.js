const cloudinary = require("cloudinary").v2;

// Configuring Cloudinary
cloudinary.config({
  cloud_name: "dy0sflvdv",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Ensure this line is correct and placed properly
});

exports.uploadImage = async (fileBuffer) => {
  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "materials",
          use_filename: true,
          unique_filename: false,
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    return uploadResult;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
