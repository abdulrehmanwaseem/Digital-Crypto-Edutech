"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import Image from "next/image";

interface IDCardProps {
  user: {
    name: string;
    email: string;
    occupation: string;
    profile?: {
      avatar?: string;
    };
  };
}

export function IDCard({ user }: IDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true, // Enable CORS to properly load images
        allowTaint: true,
      });
      const link = document.createElement("a");
      link.download = `${user.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-id-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to generate ID card:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div
        ref={cardRef}
        className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />

        {/* Company Logo on top right */}
        <div className="absolute top-4 right-4 w-20 h-20">
          <Image
            src="/images/logo.png" // Make sure this path is correct
            alt="Company Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>

        {/* Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-xl font-bold">Master Crypto Education</h2>
              <p className="text-sm opacity-90">Member ID Card</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white overflow-hidden">
              <Image
                src={user.profile?.avatar || "/placeholder-avatar.jpg"}
                alt={user.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-6 py-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Full Name</label>
              <p className="font-semibold">{user.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Occupation</label>
              <p className="font-semibold">{user.occupation}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Valid until: Dec 31, 2025</span>
              <span>ID: {user.email.split("@")[0]}</span>
            </div>
          </div>

          {/* Large logo watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <div className="w-48 h-48">
              <Image
                src="/images/logo.png"
                alt="Watermark"
                width={192}
                height={192}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleDownload} className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Download ID Card
        </Button>
      </div>
    </div>
  );
}
