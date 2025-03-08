import { Role } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    occupation: string;
    referralCode?: string;
    profile?: {
      avatar: string | null;
      bio: string | null;
      location: string | null;
      achievements: any;
      activities: any;
    } | null;
  }

  interface Session {
    user: User & {
      id: string;
      role: Role;
      occupation: string;
      referralCode?: string;
      profile?: {
        avatar: string | null;
        bio: string | null;
        location: string | null;
        achievements: any;
        activities: any;
      } | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    occupation: string;
    referralCode?: string;
    profile?: {
      avatar: string | null;
      bio: string | null;
      location: string | null;
      achievements: any;
      activities: any;
    } | null;
  }
}
