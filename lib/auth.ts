import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role, type User } from "@prisma/client";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "fa4d_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  email: string;
  role: Role;
  exp: number;
};

function secret() {
  const value = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing JWT_SECRET or NEXTAUTH_SECRET environment variable. Set it in Vercel Project Settings > Environment Variables."
    );
  }
  return value ?? "development-only-secret-change-me";
}

async function hmac(data: string) {
  const crypto = await import("crypto");
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

export async function createSession(user: Pick<User, "id" | "email" | "role">) {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + SESSION_TTL_MS
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = await hmac(encoded);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${encoded}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/"
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || (await hmac(encoded)) !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

export async function requireUser(role?: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.active) redirect("/login?error=suspended");
  if (user.expiredAt < new Date()) redirect("/login?error=expired");
  if (role && user.role !== role) redirect("/dashboard");
  return user;
}

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, message: "Invalid login credentials" };
  if (!user.active) return { ok: false, message: "Account Suspended" };
  if (user.expiredAt < new Date()) return { ok: false, message: "Membership Expired" };

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) return { ok: false, message: "Invalid login credentials" };

  await createSession(user);
  await prisma.activityLog.create({ data: { userId: user.id, action: "LOGIN" } });
  return { ok: true, message: "Logged in", role: user.role };
}
