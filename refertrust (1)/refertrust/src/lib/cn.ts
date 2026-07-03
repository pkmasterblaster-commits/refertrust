// Tiny className joiner (avoids pulling in clsx for V1).
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
