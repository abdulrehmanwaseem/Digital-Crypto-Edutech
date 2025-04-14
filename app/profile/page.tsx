import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: true,
      referralStats: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Transform user data to match the expected interface
  const userData = {
    name: user.name || "",
    email: user.email || "",
    occupation: user.occupation || "",
    referralCode: user.referralCode || "",
    profile: user.profile
      ? {
          avatar: user.profile.avatar || undefined,
          bio: user.profile.bio || undefined,
          location: user.profile.location || undefined,
          twitter: user.profile.twitter || undefined,
          telegram: user.profile.telegram || undefined,
          website: user.profile.website || undefined,
        }
      : undefined,
    withdrawalAddress: user.withdrawalAddress || undefined,
  };

  return <ProfileClient user={userData} />;
}
