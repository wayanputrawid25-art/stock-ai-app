import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-SG", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(date));
}

export function asPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
