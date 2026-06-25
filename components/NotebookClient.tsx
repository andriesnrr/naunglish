"use client"

import { useState, useCallback, useMemo } from "react"
import type { NotebookEntry } from "@/types"

type Props = {
  initialEntries: NotebookEntry[]
}

type FilterType = "all" | "word" | "rule"

const TYPE_COLORS = {
  word: { bg: "#fdf3ec", color: "#8e5d44", label: "WORD" },
  rule: { bg: "#f0f1fb", color: "#3f51b5", label: "RULE" },
}

export default function NotebookClient({ initialEntries }: Props) {
  const [entries, setEntries] = useState<NotebookEntry[]>(initialEntries)
  const [filter, setFilter] = useState<FilterType>("all")
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<"word" | "rule">("word")
  const [formContent, setFormContent] = useState("")
  const [formTags, setFormTags] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchType = filter === "all" || e.type === filter
      const q = search.toLowerCase()
      const matchSearch = !q || e.content.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q))
      return matchType && matchSearch
    })
  }, [entries, filter, search])

  const save = useCallback(async () => {
    if (!formContent.trim() || saving) return
    setSaving(true)
    try {
      const tags = formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: formType, content: formContent, tags }),
      })
      const entry = await res.json()
      if (!entry.error) {
        setEntries((prev) => [entry, ...prev])
        setFormContent("")
        setFormTags("")
        setShowForm(false)
      }
    } catch {/* ignore */}
    setSaving(false)
  }, [formContent, formTags, formType, saving])

  const remove = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      await fetch("/api/notebook", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch {/* ignore */}
    setDeletingId(null)
  }, [])

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex gap-2 flex-wrap items-center justify-between">
        {/* Filter tabs */}
        <div className="flex gap-1">
          {(["all", "word", "rule"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                backgroundColor: filter === f ? "#051f1f" : "#e8efef",
                color: filter === f ? "#e8efef" : "#414848",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        {/* Add button */}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            backgroundColor: showForm ? "#e8efef" : "#051f1f",
            color: showForm ? "#414848" : "#e8efef",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            {showForm ? "close" : "add"}
          </span>
          {showForm ? "CANCEL" : "ADD"}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
          style={{ fontSize: "18px", color: "#727878" }}
        >
          search
        </span>
        <input
          type="text"
          placeholder="Search entries or tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#c1c8c7] focus:outline-none focus:border-[#051f1f] transition-colors"
          style={{ fontFamily: "Source Serif 4, serif", color: "#161d1d", fontSize: "15px" }}
        />
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-5 flex flex-col gap-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(["word", "rule"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFormType(t)}
                className="px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  backgroundColor: formType === t ? TYPE_COLORS[t].color : "#e8efef",
                  color: formType === t ? "#fff" : "#727878",
                }}
              >
                {TYPE_COLORS[t].label}
              </button>
            ))}
          </div>
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder={formType === "word" ? "word: definition — example sentence" : "Grammar rule or tip…"}
            rows={3}
            className="w-full rounded-xl border border-[#c1c8c7] p-3 resize-none focus:outline-none focus:border-[#051f1f] transition-colors"
            style={{ fontFamily: "Source Serif 4, serif", color: "#161d1d", fontSize: "15px" }}
          />
          <input
            type="text"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
            placeholder="Tags: comma-separated (e.g. grammar, B2)"
            className="w-full rounded-xl border border-[#c1c8c7] px-3 py-2 focus:outline-none focus:border-[#051f1f] transition-colors"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "#414848", fontSize: "13px" }}
          />
          <button
            onClick={save}
            disabled={saving || !formContent.trim()}
            className="self-end px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}
          >
            {saving ? "Saving…" : "Save Entry"}
          </button>
        </div>
      )}

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-body-md italic" style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}>
            {entries.length === 0 ? "Notebook empty. Add your first entry." : "No entries match."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => {
            const meta = TYPE_COLORS[entry.type as keyof typeof TYPE_COLORS] ?? TYPE_COLORS.word
            return (
              <div
                key={entry.id}
                className="card p-4 flex gap-3"
                style={{ borderLeft: `3px solid ${meta.color}` }}
              >
                <div className="flex-1 flex flex-col gap-2">
                  <span
                    className="text-xs font-bold"
                    style={{ fontFamily: "JetBrains Mono, monospace", color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <p
                    className="text-body-md"
                    style={{
                      color: "#161d1d",
                      fontFamily: "Source Serif 4, serif",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {entry.content}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded text-xs"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            backgroundColor: "#e4e3db",
                            color: "#5f5f59",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => remove(entry.id)}
                  disabled={deletingId === entry.id}
                  className="shrink-0 self-start p-1 rounded-lg hover:bg-[#e8efef] disabled:opacity-40 transition-colors"
                  aria-label="Delete entry"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#727878" }}>
                    delete
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Count */}
      {filtered.length > 0 && (
        <p
          className="text-center text-xs"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}
        >
          {filtered.length} of {entries.length} entries
        </p>
      )}
    </div>
  )
}
