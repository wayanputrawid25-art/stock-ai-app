import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-lg border border-border/60 bg-white px-4 py-2 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[120px] w-full rounded-lg border border-border/60 bg-white px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 resize-none",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
