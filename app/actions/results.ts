"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { analyzeAll } from "@/lib/analyzer";
import { prisma } from "@/lib/db";

export async function runAnalysisAction(formData: FormData) {
  const user = await requireUser();
  const snapshotId = formData.get("snapshotId") as string | null;
  
  const whereClause = snapshotId 
    ? { userId: user.id, snapshotId }
    : { userId: user.id };
  
  const results = await prisma.result.findMany({
    where: whereClause,
    orderBy: { drawDate: "desc" },
    select: { resultNumber: true, drawDate: true, snapshotId: true }
  });
  
  const analysis = analyzeAll(results);
  
  // If snapshot specified, save to that snapshot's analysis
  const targetSnapshotId = snapshotId || results[0]?.snapshotId;
  
  if (targetSnapshotId) {
    await prisma.analysisHistory.create({
      data: { userId: user.id, snapshotId: targetSnapshotId, analysisType: "FULL_ANALYSIS", resultJson: analysis }
    });
  }
  
  await prisma.activityLog.create({ data: { userId: user.id, action: "RUN_ANALYSIS" } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
}

export async function deleteAnalysisAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  
  await prisma.analysisHistory.deleteMany({ 
    where: { id, userId: user.id } 
  });
  
  revalidatePath("/dashboard/history");
}
