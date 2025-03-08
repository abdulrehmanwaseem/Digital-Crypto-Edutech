import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function authenticateUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        role: true,
        occupation: true,
        referralCode: true,
      }
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      occupation: user.occupation,
      referralCode: user.referralCode || undefined,
    };
  } catch {
    return null;
  }
}