"use server";

import { redirect } from "next/navigation";
import { authenticate, clearSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function loginAction(_: { message?: string } | undefined, formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Enter a valid email and password" };

  const result = await authenticate(parsed.data.email, parsed.data.password);
  if (!result.ok) return { message: result.message };
  redirect(result.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
