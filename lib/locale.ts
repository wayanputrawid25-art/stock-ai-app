import "server-only";

import { cookies } from "next/headers";
import { dictionary, normalizeLocale } from "@/lib/i18n";

export async function getLocale() {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("fa4d_locale")?.value);
}

export async function getDictionary() {
  return dictionary(await getLocale());
}
