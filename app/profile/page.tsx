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
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return <ProfileClient user={user} />;
}
