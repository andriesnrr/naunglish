"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

const TABS = [
  { href: "/dashboard",        label: "Skills",      icon: "school" },
  { href: "/practice/grammar", label: "Practice",    icon: "edit_note",    matchPrefix: "/practice" },
  { href: "/mock-test",        label: "Mock Test",   icon: "assignment" },
  { href: "/notebook",         label: "Notebook",    icon: "book_2" },
  { href: "/progress",         label: "Progress",    icon: "bar_chart" },
  { href: "/leaderboard",      label: "Leaderboard", icon: "emoji_events" },
]

export default function DesktopSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  function isActive(tab: typeof TABS[0]) {
    if (tab.matchPrefix) return pathname.startsWith(tab.matchPrefix)
    return pathname === tab.href
  }

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 z-40"
      style={{ background: "#051f1f", borderRight: "1px solid #c1c8c7" }}
    >
      {/* Logo */}
      <div className="flex items-center px-5 h-14 shrink-0" style={{ borderBottom: "1px solid rgba(193,200,199,0.2)" }}>
        <span style={{ fontFamily: "Source Serif 4, serif", fontSize: "18px", fontWeight: 700, color: "#f4f7f6", letterSpacing: "-0.5px" }}>
          Naunglish
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {TABS.map(tab => {
          const active = isActive(tab)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline transition-colors"
              style={{
                backgroundColor: active ? "rgba(255,255,255,0.1)" : "transparent",
                color: active ? "#f4f7f6" : "#6f8988",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "20px",
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                  color: active ? "#f4f7f6" : "#6f8988",
                }}
              >
                {tab.icon}
              </span>
              <span style={{ fontFamily: "Source Serif 4, serif", fontSize: "14px", fontWeight: active ? 600 : 400 }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Profile */}
      <Link
        href="/profile"
        className="flex items-center gap-3 px-5 py-4 no-underline transition-colors hover:bg-white/5"
        style={{ borderTop: "1px solid rgba(193,200,199,0.2)" }}
      >
        {session?.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#6f8988" }}>account_circle</span>
        )}
        <div className="flex flex-col min-w-0">
          <span style={{ fontFamily: "Source Serif 4, serif", fontSize: "13px", fontWeight: 600, color: "#f4f7f6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session?.user?.name ?? "Profile"}
          </span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "#6f8988", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session?.user?.email ?? ""}
          </span>
        </div>
      </Link>
    </aside>
  )
}
