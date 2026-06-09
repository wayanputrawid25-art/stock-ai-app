import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - List all users
export async function GET() {
  try {
    const admin = await requireUser(Role.ADMIN);
    
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        active: true,
        expiredAt: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const admin = await requireUser(Role.ADMIN);
    const body = await request.json();
    const { name, email, password, role, plan, active, expiredAt } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || "USER",
        plan: plan || "MONTHLY",
        active: active !== false,
        expiredAt: expiredAt ? new Date(expiredAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        active: true,
        expiredAt: true,
        createdAt: true,
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        action: `ADMIN_CREATE_USER:${email}`
      }
    });

    return NextResponse.json({ user, message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}