"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera,
  Loader2,
  User,
  Mail,
  MapPin,
  Twitter,
  MessageSquare,
  Globe,
  Briefcase,
} from "lucide-react";
import { CloudinaryUploadWidget } from "@/components/cloudinary-upload-widget";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    occupation: string;
    profile?: {
      avatar?: string;
      bio?: string;
      location?: string;
      twitter?: string;
      telegram?: string;
      website?: string;
    };
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    occupation: user.occupation,
    profile: {
      bio: user.profile?.bio || "",
      location: user.profile?.location || "",
      twitter: user.profile?.twitter || "",
      telegram: user.profile?.telegram || "",
      website: user.profile?.website || "",
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAvatarUpload = async (url: string) => {
    try {
      setAvatarLoading(true);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profile: {
            ...formData.profile,
            avatar: url,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={user.profile?.avatar || "/placeholder-avatar.jpg"}
                alt={user.name}
              />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2">
              <CloudinaryUploadWidget
                onUpload={handleAvatarUpload}
                options={{
                  maxFiles: 1,
                  sources: ["local", "camera"],
                  resourceType: "image",
                  folder: "crypto-lms/avatars",
                }}
              >
                {avatarLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 h-4 w-4" />
                )}
                {avatarLoading ? "Updating..." : "Update"}
              </CloudinaryUploadWidget>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="occupation" className="text-sm font-medium">
              Occupation
            </label>
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Input
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Your occupation"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                placeholder="Your email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                name="profile.location"
                value={formData.profile.location}
                onChange={handleChange}
                placeholder="Your location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="twitter" className="text-sm font-medium">
              Twitter
            </label>
            <div className="flex items-center space-x-2">
              <Twitter className="h-4 w-4 text-muted-foreground" />
              <Input
                id="twitter"
                name="profile.twitter"
                value={formData.profile.twitter}
                onChange={handleChange}
                placeholder="Your Twitter handle"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="telegram" className="text-sm font-medium">
              Telegram
            </label>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Input
                id="telegram"
                name="profile.telegram"
                value={formData.profile.telegram}
                onChange={handleChange}
                placeholder="Your Telegram username"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="website" className="text-sm font-medium">
              Website
            </label>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                name="profile.website"
                value={formData.profile.website}
                onChange={handleChange}
                placeholder="Your website URL"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <Textarea
              id="bio"
              name="profile.bio"
              value={formData.profile.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
