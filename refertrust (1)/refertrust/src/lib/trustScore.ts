// Trust score model (V1, deliberately simple)
// - Everyone starts at 100.
// - A confirmed fake report costs the reporter -50 (penalises abuse of Report).
// - Floor at 0, ceiling at 100.
export const TRUST_START = 100;
export const FAKE_REPORT_PENALTY = 50;

export function applyFakeReportPenalty(current: number): number {
  return clampTrust(current - FAKE_REPORT_PENALTY);
}

export function clampTrust(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

// UI helper: label + colour for a trust score badge.
export function trustLabel(score: number): { text: string; tone: "good" | "ok" | "low" } {
  if (score >= 80) return { text: "Trusted", tone: "good" };
  if (score >= 50) return { text: "Okay", tone: "ok" };
  return { text: "Low trust", tone: "low" };
}
