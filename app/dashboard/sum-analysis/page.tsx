import { Suspense } from "react";
import { SumAnalyzer } from "@/components/sum-analyzer";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LoadingState } from "@/components/LoadingState";

export const dynamic = "force-dynamic";

export default async function SumAnalysisPage() {
  const user = await requireUser();
  
  // Get all snapshots with counts
  const snapshots = await prisma.snapshot.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { results: true }
      }
    }
  });

  return (
    <Suspense fallback={<LoadingState fullScreen message="Memuat..." />}>
      <SumAnalyzer initialSnapshots={snapshots} />
    </Suspense>
  );
}
