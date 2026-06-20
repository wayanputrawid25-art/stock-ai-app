import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "success" | "warning" | "gradient";
  size?: "default" | "sm" | "lg" | "icon";
};

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  gradient: "bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:shadow-md",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm",
  success: "bg-success text-white hover:bg-success/90 shadow-sm",
  warning: "bg-warning text-white hover:bg-warning/90 shadow-sm",
  destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
  outline: "border-2 border-border bg-white hover:bg-slate-50 hover:border-primary",
  ghost: "hover:bg-slate-100",
};

const sizes = {
  default: "h-11 px-5 text-sm font-medium",
  sm: "h-9 px-4 text-sm font-medium",
  lg: "h-12 px-6 text-base font-medium",
  icon: "h-10 w-10",
};

export function Button({ className, variant = "default", size = "default", asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
