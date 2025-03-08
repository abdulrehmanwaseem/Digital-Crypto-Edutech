import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { LoginSchema } from "./schemas/auth";
import { authenticateUser } from "./lib/auth-utils";
import { Role } from "@prisma/client";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        console.log(profile)
        return {        
          id: profile.sub,
          email: profile.email,
          fullName: profile.name,
          profile: {
            create: {
              bio: "Not specified",
              location: "Not specified",
              avatar: profile?.picture || null
            }
          },  
          role: "USER", // Default role
          occupation: "Not specified",
        }
        },
    }),
  
    Credentials({
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) {
          return null;
        }

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
} satisfies NextAuthConfig;

export default authConfig;
