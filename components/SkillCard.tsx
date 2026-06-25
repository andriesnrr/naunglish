import Link from "next/link"
import type { Skill } from "@/types"
import { SKILL_COLORS } from "@/types"

type Props = {
  skill: Skill
  bestScore: number | null
  cefrBand: string | null
}

export default function SkillCard({ skill, bestScore, cefrBand }: Props) {
  const { label, accent } = SKILL_COLORS[skill]
  const pct = bestScore ?? 0

  return (
    <Link
      href={`/practice/${skill}`}
      className="card p-4 flex flex-col gap-3 no-underline hover:opacity-90 transition-opacity"
    >
      {/* Eyebrow */}
      <span
        className="text-label-caps"
        style={{ color: accent }}
      >
        {label}
      </span>

      {/* Skill name */}
      <span
        className="text-headline-md capitalize"
        style={{ color: "#161d1d" }}
      >
        {skill}
      </span>

      {/* CEFR chip */}
      {cefrBand && (
        <span
          className="self-start px-2 py-0.5 rounded text-xs font-bold"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            backgroundColor: `${accent}22`,
            color: accent,
          }}
        >
          {cefrBand}
        </span>
      )}

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-[#e8efef] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: accent }}
        />
      </div>

      <span
        className="text-xs"
        style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}
      >
        {bestScore !== null ? `${pct}% best` : "Not started"}
      </span>
    </Link>
  )
}
