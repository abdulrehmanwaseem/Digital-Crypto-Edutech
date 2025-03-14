import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { getUserById } from "./services/user";
import { Role } from "@prisma/client";

const adapter = PrismaAdapter(prisma);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter,
  session: { strategy: "jwt" },
  ...authConfig,
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      return {
        ...token,
        id: existingUser.id,
        role: existingUser.role,
        occupation: existingUser.occupation,
        referralCode: existingUser.referralCode || undefined,
        profile: existingUser.profile
          ? {
              avatar: existingUser.profile.avatar,
              bio: existingUser.profile.bio,
              location: existingUser.profile.location,
              achievements: existingUser.profile.achievements,
              activities: existingUser.profile.activities,
            }
          : undefined,
      };
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub!,
          role: token.role as Role,
          occupation: token.occupation as string,
          referralCode: token.referralCode as string | undefined,
          profile: token.profile as
            | {
                avatar: string | null;
                bio: string | null;
                location: string | null;
                achievements: any;
                activities: any;
              }
            | undefined,
        },
      };
    },
  },
});
