import { z } from "zod";

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Nama minimal harus 2 karakter." })
    .trim(),
  email: z
    .string()
    .email({ message: "Format email tidak valid." })
    .trim(),
  password: z
    .string()
    .min(6, { message: "Password minimal 6 karakter." })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z
    .string()
    .email({ message: "Format email tidak valid." })
    .trim(),
  password: z
    .string()
    .min(1, { message: "Password wajib diisi." })
    .trim(),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  email: string;
  name?: string | null;
  expiresAt: Date;
};
