import { LoginForm } from "@/components/login-form";
import { getDictionary } from "@/lib/locale";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const t = await getDictionary();
  const params = await searchParams;
  const message = params.error === "suspended" ? "Account Suspended" : params.error === "expired" ? "Membership Expired" : undefined;
  return <LoginForm initialMessage={message} labels={t.login} />;
}
