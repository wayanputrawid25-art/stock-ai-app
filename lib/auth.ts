import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role, type User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { z } from "zod";

const SESSION_COOKIE = "fa4d_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  email: string;
  role: Role;
  exp: number;
};

// Type guard for session payload validation
function isSessionPayload(data: unknown): data is SessionPayload {
  return (
    typeof data === "object" &&
    data !== null &&
    "userId" in data &&
    "email" in data &&
    "role" in data &&
    "exp" in data &&
    typeof (data as any).userId === "string" &&
    typeof (data as any).email === "string" &&
    typeof (data as any).exp === "number" &&
    Object.values(Role).includes((data as any).role)
  );
}

// Validation schemas
const LoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128)
});

type LoginInput = z.infer<typeof LoginSchema>;

function secret() {
  const value = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  
  if (!value) {
    const errorMsg =
      "CRITICAL: Missing JWT_SECRET or NEXTAUTH_SECRET environment variable. " +
      "Set it in Vercel Project Settings > Environment Variables or .env file.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (value.length < 32) {
    console.warn("⚠️ WARNING: Secret key is too short (should be at least 32 characters)");
  }

  return value;
}

async function hmac(data: string) {
  const crypto = await import("crypto");
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

export async function createSession(user: Pick<User, "id" | "email" | "role">) {
  try {
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

    console.debug(`✓ Session created for user ${user.email}`);
  } catch (error) {
    console.error(
      "Session creation failed:",
      error instanceof Error ? error.message : String(error)
    );
    throw new Error("Failed to create session. Please try again.");
  }
}

export async function clearSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    console.debug("✓ Session cleared");
  } catch (error) {
    console.error(
      "Session clear failed:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return null;
    }

    const [encoded, signature] = token.split(".");

    if (!encoded || !signature) {
      console.warn("⚠️ Invalid session token format (missing parts)");
      return null;
    }

    const expectedSignature = await hmac(encoded);
    if (expectedSignature !== signature) {
      console.warn("⚠️ Invalid session token signature (tampering detected?)");
      return null;
    }

    try {
      const payload = JSON.parse(
        Buffer.from(encoded, "base64url").toString("utf8")
      );

      if (!isSessionPayload(payload)) {
        console.warn("⚠️ Invalid session payload structure");
        return null;
      }

      if (payload.exp < Date.now()) {
        console.debug("Session expired");
        return null;
      }

      return payload;
    } catch (parseError) {
      console.error(
        "Session parsing error:",
        parseError instanceof Error ? parseError.message : String(parseError)
      );
      return null;
    }
  } catch (error) {
    console.error(
      "getSession error:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user) {
      console.warn(`⚠️ User ${session.userId} not found in database`);
      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "getCurrentUser error:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

export async function requireUser(role?: Role) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/login");
    }

    if (!user.active) {
      redirect("/login?error=suspended");
    }

    if (user.expiredAt < new Date()) {
      redirect("/login?error=expired");
    }

    if (role && user.role !== role) {
      redirect("/dashboard");
    }

    return user;
  } catch (error) {
    console.error(
      "requireUser error:",
      error instanceof Error ? error.message : String(error)
    );
    redirect("/login?error=auth_error");
  }
}

async function logActivity(
  userId: string | undefined,
  action: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: { userId: userId || null, action }
    });
  } catch (error) {
    console.error(
      `Failed to log activity [${action}]:`,
      error instanceof Error ? error.message : String(error)
    );
    // Don't throw - activity logging should not block auth flow
  }
}

export async function authenticate(
  email: string,
  password: string
): Promise<{
  ok: boolean;
  message: string;
  role?: Role;
  errors?: Record<string, string[]>;
}> {
  try {
    // Validate input
    const result = LoginSchema.safeParse({ email, password });

    if (!result.success) {
      console.warn("Login validation failed:", result.error.flatten());
      return {
        ok: false,
        message: "Invalid email or password format",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>
      };
    }

    const { email: validEmail, password: validPassword } = result.data;

    // Check rate limit
    const isAllowed = await checkRateLimit(validEmail);
    if (!isAllowed) {
      await logActivity(undefined, `LOGIN_RATE_LIMIT_${validEmail}`);
      return {
        ok: false,
        message: "Too many login attempts. Please try again in 5 minutes."
      };
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email: validEmail }
    });

    if (!user) {
      await logActivity(undefined, `LOGIN_FAILED_USER_NOT_FOUND_${validEmail}`);
      // Don't reveal if user exists (security best practice)
      return { ok: false, message: "Invalid login credentials" };
    }

    if (!user.active) {
      await logActivity(user.id, "LOGIN_FAILED_SUSPENDED");
      return { ok: false, message: "Account Suspended" };
    }

    if (user.expiredAt < new Date()) {
      await logActivity(user.id, "LOGIN_FAILED_EXPIRED");
      return { ok: false, message: "Membership Expired" };
    }

    // Check password
    const passwordOk = await bcrypt.compare(validPassword, user.passwordHash);
    if (!passwordOk) {
      await logActivity(user.id, "LOGIN_FAILED_WRONG_PASSWORD");
      await recordLoginAttempt(validEmail, false);
      return { ok: false, message: "Invalid login credentials" };
    }

    // Create session
    await createSession(user);
    await logActivity(user.id, "LOGIN");
    await recordLoginAttempt(validEmail, true);

    return {
      ok: true,
      message: "Logged in successfully",
      role: user.role
    };
  } catch (error) {
    console.error(
      "Authentication error:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      ok: false,
      message: "Authentication service temporarily unavailable"
    };
  }
}

async function checkRateLimit(email: string): Promise<boolean> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const failedAttempts = await prisma.loginAttempt.count({
      where: {
        email,
        timestamp: { gte: fiveMinutesAgo },
        success: false
      }
    });

    const isAllowed = failedAttempts < 5;

    if (!isAllowed) {
      console.warn(`🚫 Rate limit exceeded for ${email}`);
    }

    return isAllowed;
  } catch (error) {
    console.error(
      "Rate limit check error:",
      error instanceof Error ? error.message : String(error)
    );
    // On error, allow the attempt (fail open)
    return true;
  }
}

async function recordLoginAttempt(
  email: string,
  success: boolean
): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: { email, success }
    });
  } catch (error) {
    console.error(
      "Failed to record login attempt:",
      error instanceof Error ? error.message : String(error)
    );
    // Don't throw - this should not block auth flow
  }
}
