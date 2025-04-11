import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      }
    ),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  occupation: z.string().min(1, {
    message: "Occupation is required",
  }),
  incomeRange: z.string().min(1, {
    message: "Income range is required",
  }),
  occupationType: z.string().min(1, {
    message: "Occupation type is required",
  }),
  phone: z.string().min(10, {
    message: "Phone number is required",
  }),
  referralCode: z.string().nullable().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
