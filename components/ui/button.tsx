import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "success" | "warning" | "gradient" | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
  gradient: "bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:shadow-lg shadow-primary/20",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm hover:shadow-md",
  success: "bg-success text-white hover:bg-success/90 shadow-sm hover:shadow-md",
  warning: "bg-warning text-white hover:bg-warning/90 shadow-sm hover:shadow-md",
  destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-sm hover:shadow-md",
  outline: "border border-border/60 bg-white hover:bg-slate-50/80 hover:border-primary/50 hover:shadow-sm",
  ghost: "hover:bg-slate-100/80",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizes = {
  default: "h-10 px-4 py-2 text-sm font-medium rounded-lg",
  sm: "h-9 px-3 text-sm font-medium rounded-md",
  lg: "h-11 px-6 text-base font-medium rounded-lg",
  icon: "h-10 w-10 rounded-lg",
};

export function Button({ className, variant = "default", size = "default", asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
