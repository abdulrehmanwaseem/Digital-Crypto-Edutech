"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CloudinaryUploadWidgetProps {
  onUpload: (url: string) => void;
  options?: {
    maxFiles?: number;
    sources?: string[];
    resourceType?: string;
    folder?: string;
  };
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

export function CloudinaryUploadWidget({
  onUpload,
  children,
  onError,
}: CloudinaryUploadWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      const error = new Error("Please upload an image file");
      onError?.(error);
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      const error = new Error("File size should be less than 5MB");
      onError?.(error);
      toast({
        title: "Error",
        description: "File size should be less than 5MB",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    // Simulate file upload with a timeout
    setTimeout(() => {
      // Generate a fake data URL for the image
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Call the onUpload function with the data URL
        onUpload(result);
        setIsUploading(false);
        setUploadComplete(true);
        // Reset after a while
        setTimeout(() => setUploadComplete(false), 3000);
      };
    }, 1000);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="flex items-center"
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : uploadComplete ? (
          <Check className="mr-2 h-4 w-4 text-green-500" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isUploading ? "Uploading..." : uploadComplete ? "Uploaded!" : children}
      </Button>
    </>
  );
}
