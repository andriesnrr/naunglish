import type { CEFRBand } from "@/types"

export function getCEFR(pct: number): CEFRBand {
  if (pct >= 90) return "C2"
  if (pct >= 80) return "C1"
  if (pct >= 65) return "B2"
  if (pct >= 50) return "B1"
  if (pct >= 35) return "A2"
  return "A1"
}
