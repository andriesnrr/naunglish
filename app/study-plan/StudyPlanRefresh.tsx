"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function StudyPlanRefresh() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const regenerate = async () => {
    setLoading(true)
    try {
      await fetch("/api/study-plan", { method: "POST" })
      router.refresh()
    } catch {/* ignore */}
    setLoading(false)
  }

  return (
    <button
      onClick={regenerate}
      disabled={loading}
      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#c1c8c7] hover:bg-[#e8efef] disabled:opacity-40 transition-colors text-sm"
      style={{ fontFamily: "Source Serif 4, serif", color: "#414848" }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
        refresh
      </span>
      {loading ? "Updating…" : "Regenerate"}
    </button>
  )
}
