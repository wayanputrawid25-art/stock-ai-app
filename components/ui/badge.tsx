import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "hot" | "cold" | "info";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Badge({ children, variant = "default", className = "", size = "sm" }: BadgeProps) {
  const baseClasses = "inline-flex items-center font-semibold uppercase tracking-wide";
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] rounded-md",
    md: "px-2.5 py-1 text-xs rounded-lg",
    lg: "px-3 py-1.5 text-sm rounded-xl",
  };

  const variantClasses = {
    default: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
    hot: "bg-gradient-to-r from-hot/20 to-hot-light text-hot",
    cold: "bg-gradient-to-r from-cold/20 to-cold-light text-cold",
    outline: "border-2 border-border text-foreground",
  };

  return (
    <span className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}>
      {children}
    </span>
  );
}