import { useCallback, useState } from "react"
import { CldUploadWidget } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"

type CloudinaryUploadSource = 
  | "local"
  | "camera"
  | "dropbox"
  | "facebook"
  | "gettyimages"
  | "google_drive"
  | "image_search"
  | "instagram"
  | "istock"
  | "shutterstock"
  | "unsplash"
  | "url"

interface CloudinaryUploadWidgetProps {
  onUpload: (url: string) => void
  onError?: (error: Error) => void
  children?: React.ReactNode
  options?: {
    maxFiles?: number
    sources?: CloudinaryUploadSource[]
    resourceType?: "image" | "video" | "raw" | "auto"
    folder?: string
  }
}

export function CloudinaryUploadWidget({
  onUpload,
  onError,
  children,
  options = {
    maxFiles: 1,
    sources: ["local", "camera"],
    resourceType: "image",
    folder: "crypto-lms/avatars",
  },
}: CloudinaryUploadWidgetProps) {
  const [loading, setLoading] = useState(false)

  const handleUploadSuccess = useCallback(
    (result: any) => {
      if (result?.info?.secure_url) {
        onUpload(result.info.secure_url)
        setLoading(false)
      }
    },
    [onUpload]
  )

  const handleUploadError = useCallback((error: any) => {
    console.error("Upload error:", error)
    setLoading(false)
    if (onError) {
      onError(new Error(error.message || "Failed to upload file"))
    }
  }, [onError])

  return (
    <CldUploadWidget
      uploadPreset="crypto-lms-preset"
      onSuccess={handleUploadSuccess}
      onError={handleUploadError}
      options={{
        ...options,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        multiple: false,
        cropping: true,
        croppingShowDimensions: true,
        showSkipCropButton: false,
        croppingAspectRatio: 1,
        maxFileSize: 2000000, // 2MB
        clientAllowedFormats: ["png", "jpeg", "jpg", "gif"],
      }}
    >
      {({ open }) => {
        function handleOnClick(e: React.MouseEvent) {
          e.preventDefault()
          e.stopPropagation()
          setLoading(true)
          open()
        }
        return children ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleOnClick}
            disabled={loading}
            className="w-full flex items-center justify-center"
          >
            {children}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleOnClick}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>
        )
      }}
    </CldUploadWidget>
  )
}
