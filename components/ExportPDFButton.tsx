"use client"

import { useState } from "react"

export default function ExportPDFButton() {
  const [loading, setLoading] = useState(false)

  const download = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/export/pdf")
      if (!res.ok) throw new Error("Failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `naunglish-progress-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Could not generate PDF. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={download}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#c1c8c7] hover:bg-[#e8efef] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      style={{ fontFamily: "Source Serif 4, serif", color: "#414848", fontSize: "14px" }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
        {loading ? "hourglass_empty" : "download"}
      </span>
      {loading ? "Generating…" : "Export PDF"}
    </button>
  )
}
