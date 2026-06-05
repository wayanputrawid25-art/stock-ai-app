import { setLocaleAction } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locale, label, compact = false }: { locale: Locale; label: string; compact?: boolean }) {
  const options: Array<{ value: Locale; label: string }> = [
    { value: "id", label: "ID" },
    { value: "en", label: "EN" }
  ];

  return (
    <div className={cn("flex items-center gap-2", compact ? "" : "rounded-md border bg-background p-1")}>
      <span className={cn("text-xs text-muted-foreground", compact ? "sr-only" : "")}>{label}</span>
      {options.map((option) => (
        <form action={setLocaleAction} key={option.value}>
          <input type="hidden" name="locale" value={option.value} />
          <button
            className={cn(
              "h-8 rounded-md px-2 text-xs font-medium transition-colors hover:bg-accent",
              locale === option.value ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
            type="submit"
          >
            {option.label}
          </button>
        </form>
      ))}
    </div>
  );
}
