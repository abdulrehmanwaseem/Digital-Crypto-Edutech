"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import Image from "next/image";

export const UploadProof = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/payment/upload-proof", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setFile(null);
        setPreview("");
      }
    } catch (error) {
      console.error("Error uploading proof:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Upload Payment Proof</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="proof"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="proof"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              Click to upload payment proof
            </span>
          </label>
          {preview && (
            <div className="mt-4 relative h-48 w-full">
              <Image
                src={preview}
                alt="Payment proof"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!file}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Submit Proof
        </button>
      </form>
    </div>
  );
};
