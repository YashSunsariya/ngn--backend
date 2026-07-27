import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadBuffer = (buffer, folder) => {
  
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,

        resource_type: "image",

        format: "webp",

        transformation: [
          {
            fetch_format: "webp",
            quality: "auto",
          },
        ],
      },

      (error, result) => {
        if (error) return reject(error);

        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const uploadSingleImageImage = async (
  file,
  folder = "uploads"
) => {
  if (!file) return null;

  const result = await uploadBuffer(file.buffer, folder);

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};

export const uploadMultipleImages = async (
  files,
  folder = "uploads"
) => {
  if (!files || files.length === 0) return [];

  const uploads = files.map((file) =>
    uploadBuffer(file.buffer, folder)
  );

  const results = await Promise.all(uploads);

  return results.map((item) => ({
    url: item.secure_url,
    public_id: item.public_id,
  }));
};

export const deleteImage = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};