import { z } from "zod";

export const paymentSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().default("USD"),
  transactionId: z.string().min(1, "Transaction ID is required"),
  proofImageUrl: z.string().url("Valid proof image URL is required"),
  referralCode: z.string().nullable().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
