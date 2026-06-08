import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/snapshots/[id] - Get single snapshot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const snapshot = await prisma.snapshot.findFirst({
      where: { id, userId: user.id },
      include: {
        _count: {
          select: { results: true, analyses: true }
        }
      }
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("Get snapshot error:", error);
    return NextResponse.json({ error: "Failed to get snapshot" }, { status: 500 });
  }
}

// DELETE /api/snapshots/[id] - Delete snapshot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    // Verify ownership
    const snapshot = await prisma.snapshot.findFirst({
      where: { id, userId: user.id }
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found or access denied" }, { status: 404 });
    }

    // Delete snapshot (cascade will handle related data)
    await prisma.snapshot.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Snapshot "${snapshot.title}" deleted` 
    });
  } catch (error) {
    console.error("Delete snapshot error:", error);
    return NextResponse.json({ error: "Failed to delete snapshot" }, { status: 500 });
  }
}