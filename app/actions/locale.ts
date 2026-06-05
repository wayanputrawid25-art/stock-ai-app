"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeLocale } from "@/lib/i18n";

export async function setLocaleAction(formData: FormData) {
  const locale = normalizeLocale(String(formData.get("locale") || "id"));
  const cookieStore = await cookies();
  cookieStore.set("fa4d_locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  const headerStore = await headers();
  const referer = headerStore.get("referer");
  redirect(referer || "/");
}
