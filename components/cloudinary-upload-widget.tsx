"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface CloudinaryUploadWidgetProps {
  onUpload: (url: string) => void;
  options?: {
    maxFiles?: number;
    sources?: string[];
    resourceType?: string;
    folder?: string;
  };
  children: React.ReactNode;
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: any,
        callback: (error: any, result: any) => void
      ) => {
        open: () => void;
        close: () => void;
      };
    };
  }
}

export function CloudinaryUploadWidget({
  onUpload,
  options = {},
  children,
}: CloudinaryUploadWidgetProps) {
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          ...options,
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            onUpload(result.info.secure_url);
          }
        }
      );
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.close();
      }
    };
  }, [onUpload, options]);

  const handleClick = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="flex items-center"
    >
      {children}
    </Button>
  );
}
