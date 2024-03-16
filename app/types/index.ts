import { z } from "zod";

export const SignUpFormSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .min(8, { message: "Username must be at least 8 characters long." })
      .max(50, { message: "Username must be less then 50 characters" }),
    password: z
      .string()
      .trim()
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(50, { message: "Password must be less then 50 characters" }),
    confirmPassword: z
      .string()
      .trim()
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(50, { message: "Password must be less then 50 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const SignInFormSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .min(8, { message: "Username must be at least 8 characters long." })
    .max(50, { message: "Username must be less then 50 characters" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(50, { message: "Password must be less then 50 characters" }),
});
