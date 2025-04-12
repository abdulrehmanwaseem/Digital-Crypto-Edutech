// app/api/auth/forgot-password/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  phone: z.string().min(5, "Phone number is required"),
});

// Function to generate a strong random password
function generateStrongPassword() {
  const length = 12;
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numericChars = "0123456789";
  const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?";

  const allChars =
    uppercaseChars + lowercaseChars + numericChars + specialChars;

  // Ensure at least one character of each type
  let password =
    uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)) +
    lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)) +
    numericChars.charAt(Math.floor(Math.random() * numericChars.length)) +
    specialChars.charAt(Math.floor(Math.random() * specialChars.length));

  // Fill the rest of the password length
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password characters
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

// Mock email sending function
async function sendEmail(email: string, password: string) {
  // In production, integrate with an email service provider
  console.log(`Sending email to ${email} with new password: ${password}`);
  return true;
}

// Mock SMS sending function
async function sendSMS(phoneNumber: string, password: string) {
  // In production, integrate with an SMS service provider
  console.log(`Sending SMS to ${phoneNumber} with new password: ${password}`);
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedFields = forgotPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validatedFields.error.flatten() },
        { status: 400 }
      );
    }

    const { email, phone } = validatedFields.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if the email exists or not for security
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, a password reset has been sent",
        },
        { status: 200 }
      );
    }

    // Verify phone number matches
    if (user.phone !== phone) {
      return NextResponse.json(
        { error: "Email and phone number don't match our records" },
        { status: 400 }
      );
    }

    // Generate a strong random password
    const newPassword = generateStrongPassword();

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        // Optionally track password reset events
        updatedAt: new Date(),
      },
    });

    // Send the new password to the user's email and phone
    await Promise.all([
      sendEmail(email, newPassword),
      sendSMS(phone, newPassword),
    ]);

    return NextResponse.json({
      message:
        "Password reset successful. Check your email and phone for the new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset" },
      { status: 500 }
    );
  }
}
