import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    outline: "border border-slate-300 text-slate-800 hover:bg-slate-50",
    ghost: "text-brand hover:bg-brand-light",
  };
  const sizes = { md: "h-11 px-4 text-sm", lg: "h-14 px-5 text-base w-full" };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
