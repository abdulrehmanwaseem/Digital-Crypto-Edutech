"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Check, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  className?: string;
}

export function CloudinaryUploadWidget({
  onUpload,
  children,
  onError,
  className,
}: CloudinaryUploadWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      const error = new Error("Please upload an image file");
      setError("Please upload an image file");
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
      setError("File size should be less than 5MB");
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

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError(null);
    onUpload("");
  };

  return (
    <div className={cn("relative", className)}>
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
        className={cn(
          "flex items-center w-full",
          error && "border-red-500",
          uploadComplete && "border-green-500"
        )}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : uploadComplete ? (
          <Check className="mr-2 h-4 w-4 text-green-500" />
        ) : error ? (
          <X className="mr-2 h-4 w-4 text-red-500" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isUploading ? "Uploading..." : uploadComplete ? "Uploaded!" : children}
      </Button>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      {uploadComplete && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
