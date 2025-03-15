import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "./schemas/auth";
import { authenticateUser } from "./lib/auth-utils";
import {
  Role,
  User as PrismaUser,
  Profile,
  Prisma,
  ReferralStats,
  Wallet,
} from "@prisma/client";
import { generateReferralCode } from "./lib/utils";

type UserProfile = {
  avatar: string;
  bio: string;
  location: string;
  twitter: string;
  telegram: string;
  website: string;
  achievements: Prisma.JsonValue[];
  activities: Prisma.JsonValue[];
};

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  occupation: string;
  referralCode: string;
  profile: UserProfile;
  referralStats: {
    totalReferrals: number;
    activeReferrals: number;
    earnings: number;
  };
  wallet: {
    balance: number;
    referralBonus: number;
    stipendBonus: number;
  };
};

type GoogleProfile = {
  sub: string;
  name: string;
  given_name: string;
  email: string;
  picture: string;
};

type DbUser = PrismaUser & {
  profile: Profile | null;
  referralStats: ReferralStats | null;
  wallet: Wallet | null;
};

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
  interface JWT {
    id: string;
    role?: Role;
  }
}

const defaultProfile = {
  bio: "Not specified",
  location: "Not specified",
  avatar: "",
  twitter: "",
  telegram: "",
  website: "",
  achievements: JSON.stringify([]),
  activities: JSON.stringify([]),
};

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          profile: { create: { avatar: profile.picture } },
          role: "USER" as Role,
          occupation: "Not specified",
        };
      },
    }),
    Credentials({
      async authorize(credentials) {
        if (!credentials) return null;

        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;
        const user = await authenticateUser(email, password);
        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async session({ session, token }) {
      const dbUser = (await prisma.user.findUnique({
        where: { id: token.id as string },
        include: {
          profile: true,
          referralStats: true,
          wallet: true,
        },
      })) as (DbUser & { referralStats: any; wallet: any }) | null;

      if (!dbUser) {
        throw new Error("User not found");
      }

      const user: SessionUser = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        occupation: dbUser.occupation,
        referralCode: dbUser.referralCode ?? "",
        profile: {
          avatar: dbUser.profile?.avatar ?? defaultProfile.avatar,
          bio: dbUser.profile?.bio ?? defaultProfile.bio,
          location: dbUser.profile?.location ?? defaultProfile.location,
          twitter: dbUser.profile?.twitter ?? defaultProfile.twitter,
          telegram: dbUser.profile?.telegram ?? defaultProfile.telegram,
          website: dbUser.profile?.website ?? defaultProfile.website,
          achievements: dbUser.profile?.achievements
            ? JSON.parse(dbUser.profile.achievements as string)
            : [],
          activities: dbUser.profile?.activities
            ? JSON.parse(dbUser.profile.activities as string)
            : [],
        },
        referralStats: dbUser.referralStats ?? {
          totalReferrals: 0,
          activeReferrals: 0,
          earnings: 0,
        },
        wallet: dbUser.wallet ?? {
          balance: 0,
          referralBonus: 0,
          stipendBonus: 0,
        },
      };

      return {
        ...session,
        user,
      };
    },
    async signIn({ user: oauthUser, account, profile }) {
      try {
        if (!oauthUser?.email) return false;

        const existingUser = (await prisma.user.findUnique({
          where: { email: oauthUser.email },
          include: {
            profile: true,
            referralStats: true,
            wallet: true,
          },
        })) as DbUser | null;

        if (!existingUser) {
          if (account?.provider === "google") {
            // Generate a unique referral code
            let newReferralCode = generateReferralCode();
            let existingUserWithCode = await prisma.user.findUnique({
              where: { referralCode: newReferralCode },
            });

            // Keep generating until we find a unique code
            while (existingUserWithCode) {
              newReferralCode = generateReferralCode();
              existingUserWithCode = await prisma.user.findUnique({
                where: { referralCode: newReferralCode },
              });
            }

            await prisma.user.create({
              data: {
                email: oauthUser.email,
                name: oauthUser.name ?? "Anonymous User",
                role: "USER",
                occupation: "Not specified",
                referralCode: newReferralCode,
                profile: {
                  create: {
                    ...defaultProfile,
                    avatar: oauthUser.image ?? defaultProfile.avatar,
                  },
                },
                referralStats: {
                  create: {
                    totalReferrals: 0,
                    activeReferrals: 0,
                    earnings: 0,
                  },
                },
                wallet: {
                  create: {
                    balance: 0,
                    referralBonus: 0,
                    stipendBonus: 0,
                  },
                },
              },
            });
          } else {
            return false;
          }
        } else if (account?.provider === "google") {
          // Generate referral code if it doesn't exist
          if (!existingUser.referralCode) {
            let newReferralCode = generateReferralCode();
            let existingUserWithCode = await prisma.user.findUnique({
              where: { referralCode: newReferralCode },
            });

            while (existingUserWithCode) {
              newReferralCode = generateReferralCode();
              existingUserWithCode = await prisma.user.findUnique({
                where: { referralCode: newReferralCode },
              });
            }

            await prisma.user.update({
              where: { id: existingUser.id },
              data: { referralCode: newReferralCode },
            });
          }

          // Check and create referral stats if they don't exist
          if (!existingUser.referralStats) {
            await prisma.referralStats.create({
              data: {
                userId: existingUser.id,
                totalReferrals: 0,
                activeReferrals: 0,
                earnings: 0,
              },
            });
          }

          // Check and create wallet if it doesn't exist
          if (!existingUser.wallet) {
            await prisma.wallet.create({
              data: {
                userId: existingUser.id,
                balance: 0,
                referralBonus: 0,
                stipendBonus: 0,
              },
            });
          }

          if (!existingUser.profile) {
            await prisma.profile.create({
              data: {
                userId: existingUser.id,
                ...defaultProfile,
                avatar: oauthUser.image ?? defaultProfile.avatar,
              },
            });
          } else {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: oauthUser.name ?? existingUser.name,
                profile: {
                  update: {
                    avatar: oauthUser.image ?? existingUser.profile.avatar,
                  },
                },
              },
            });
          }
        }

        return true;
      } catch (error) {
        console.error("SignIn Error:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        token.id = user.id;
        token.role = user.role as Role;
      } else if (token.sub && !token.id) {
        token.id = token.sub;
      }

      return token;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
