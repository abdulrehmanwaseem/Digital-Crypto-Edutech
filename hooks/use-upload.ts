import { useState } from "react";
import { toast } from "sonner";

interface UseUploadOptions {
  type?: "avatar" | "payment";
  onSuccess?: (url: string) => void;
}

export const useUpload = ({ type = "avatar", onSuccess }: UseUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);

      // Basic validation
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData: base64Data, type }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to upload image");
          }

          const data = await response.json();
          toast.success("Image uploaded successfully");
          onSuccess?.(data.url);
        } catch (error) {
          console.error("Upload Error:", error);
          toast.error("Failed to upload image");
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read image file");
        setIsUploading(false);
      };
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleImageUpload,
  };
};
