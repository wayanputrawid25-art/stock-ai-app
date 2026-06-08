import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - List all snapshots for user with CORRECT counts
export async function GET() {
  try {
    const user = await requireUser();
    
    const snapshots = await prisma.snapshot.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { results: true }  // Same as dashboard - count only results
        }
      }
    });

    return NextResponse.json({ snapshots });
  } catch (error) {
    console.error("Get snapshots error:", error);
    return NextResponse.json({ error: "Failed to get snapshots" }, { status: 500 });
  }
}

// POST - Create new snapshot
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { title, color } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Check for duplicate title for this user
    const existing = await prisma.snapshot.findFirst({
      where: { userId: user.id, title: title.trim() }
    });

    if (existing) {
      // Return existing snapshot with count
      const snapshotWithCount = await prisma.snapshot.findUnique({
        where: { id: existing.id },
        include: { _count: { select: { results: true } } }
      });
      return NextResponse.json({ 
        snapshot: snapshotWithCount, 
        message: "Snapshot already exists, using existing one" 
      });
    }

    const snapshot = await prisma.snapshot.create({
      data: {
        userId: user.id,
        title: title.trim(),
        color: color || "#3B82F6"
      },
      include: {
        _count: { select: { results: true } }  // Include count like GET
      }
    });

    return NextResponse.json({ snapshot, message: "Snapshot created" }, { status: 201 });
  } catch (error) {
    console.error("Create snapshot error:", error);
    return NextResponse.json({ error: "Failed to create snapshot" }, { status: 500 });
  }
}
