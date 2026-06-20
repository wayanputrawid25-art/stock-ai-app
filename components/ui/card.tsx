import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, hover = false, gradient = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean; gradient?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-white shadow-sm",
        hover && "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
        gradient && "bg-gradient-to-br from-white to-slate-50",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-foreground tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground mt-1", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4 border-t border-border/50 bg-slate-50/50 rounded-b-xl", className)} {...props} />;
}
