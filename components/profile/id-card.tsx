"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";

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

        {/* Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-xl font-bold">Crypto LMS</h2>
              <p className="text-sm opacity-90">Member ID Card</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white overflow-hidden">
              <img
                src={user.profile?.avatar || "/placeholder-avatar.jpg"}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-6 py-4">
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
              <span>Valid until: Dec 31, 2024</span>
              <span>ID: {user.email.split("@")[0]}</span>
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
