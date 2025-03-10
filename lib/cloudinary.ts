import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToCloudinary = async (
  file: string,
  folder: string = "avatars"
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `crypto-lms/${folder}`,
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    })
    return result.secure_url
  } catch (error) {
    console.error("Cloudinary Upload Error:", error)
    throw new Error("Failed to upload image")
  }
}

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error("Cloudinary Delete Error:", error)
    throw new Error("Failed to delete image")
  }
}

export default cloudinary
