"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  icon?: "plus" | "document" | "chart";
}

function EmptyIcon({ type }: { type: EmptyStateProps["icon"] }) {
  if (type === "plus") {
    return (
      <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "document") {
    return (
      <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
  icon = "document"
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6 bg-gradient-to-b from-slate-50/50 to-white rounded-2xl border border-dashed border-border/60">
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
        <EmptyIcon type={icon} />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">{description}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {actionLabel && actionHref && (
          <Button asChild className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/20">
            <Link href={actionHref}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {actionLabel}
            </Link>
          </Button>
        )}
        {secondaryActionLabel && secondaryActionHref && (
          <Button asChild variant="outline" className="border-border/60 hover:bg-slate-50">
            <Link href={secondaryActionHref}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {secondaryActionLabel}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}