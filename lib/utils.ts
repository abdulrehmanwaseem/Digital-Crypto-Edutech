import { auth } from "@/auth";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

/**
 * Generates a referral code based on user name and random string
 * @param userName User's name or a fallback string
 * @returns A unique referral code
 */
export function generateReferralCode(userName?: string): string {
  // Clean and format the user name if provided
  const baseName = userName
    ? userName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 8)
    : "user";

  // Generate a random alphanumeric string
  const randomChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like 0, O, 1, I
  let randomPart = "";

  for (let i = 0; i < 6; i++) {
    randomPart += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }

  // Combine name and random part with a separator
  return `${baseName.slice(0, 4)}${randomPart}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat("en-US").format(number);
}
