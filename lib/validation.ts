import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128)
});

export const userSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128).optional().or(z.literal("")),
  role: z.enum(["ADMIN", "USER"]),
  plan: z.enum(["MONTHLY", "YEARLY", "LIFETIME"]),
  active: z.coerce.boolean(),
  expiredAt: z.coerce.date()
});

export const resultInputSchema = z.object({
  raw: z.string().min(1).max(100_000),
  drawDate: z.coerce.date()
});

export function extractValid4D(input: string) {
  return Array.from(new Set(input.match(/\b\d{4}\b/g) ?? []));
}
