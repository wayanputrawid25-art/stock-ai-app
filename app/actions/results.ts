"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { analyzeResults } from "@/lib/analysis";
import { prisma } from "@/lib/db";
import { extractValid4D, resultInputSchema } from "@/lib/validation";

export async function saveManualResultsAction(_: { message?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = resultInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Paste valid data and select a draw date" };

  const numbers = extractValid4D(parsed.data.raw);
  if (!numbers.length) return { message: "No valid 4-digit results found" };

  await prisma.result.createMany({
    data: numbers.map((resultNumber) => ({ userId: user.id, resultNumber, drawDate: parsed.data.drawDate })),
    skipDuplicates: true
  });
  await prisma.activityLog.create({ data: { userId: user.id, action: `RESULT_INPUT:${numbers.length}` } });
  revalidatePath("/dashboard");
  return { message: `Saved ${numbers.length} valid result values` };
}

export async function runAnalysisAction() {
  const user = await requireUser();
  const results = await prisma.result.findMany({
    where: { userId: user.id },
    orderBy: { drawDate: "desc" },
    select: { resultNumber: true, drawDate: true }
  });
  const analysis = analyzeResults(results);
  await prisma.analysisHistory.create({
    data: { userId: user.id, analysisType: "FULL_ANALYSIS", resultJson: analysis }
  });
  await prisma.activityLog.create({ data: { userId: user.id, action: "RUN_ANALYSIS" } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
}

export async function deleteAnalysisAction(formData: FormData) {
  const user = await requireUser();
  await prisma.analysisHistory.deleteMany({ where: { id: String(formData.get("id")), userId: user.id } });
  revalidatePath("/dashboard/history");
}
