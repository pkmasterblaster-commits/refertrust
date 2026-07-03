import { cn } from "@/lib/cn";

type Tone = "good" | "ok" | "low" | "brand" | "muted";

export function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: Tone }) {
  const tones: Record<Tone, string> = {
    good: "bg-emerald-50 text-emerald-700",
    ok: "bg-amber-50 text-amber-700",
    low: "bg-red-50 text-red-700",
    brand: "bg-brand-light text-brand-dark",
    muted: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
