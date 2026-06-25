"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  {
    href: "/dashboard",
    label: "Skills",
    iconOutlined: "school",
    iconFilled: "school",
  },
  {
    href: "/practice/grammar",
    label: "Practice",
    iconOutlined: "edit_note",
    iconFilled: "edit_note",
    matchPrefix: "/practice",
  },
  {
    href: "/mock-test",
    label: "Mock Test",
    iconOutlined: "assignment",
    iconFilled: "assignment",
  },
  {
    href: "/notebook",
    label: "Notebook",
    iconOutlined: "book_2",
    iconFilled: "book_2",
  },
  {
    href: "/progress",
    label: "Progress",
    iconOutlined: "bar_chart",
    iconFilled: "bar_chart",
  },
] as const

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 md:hidden"
      style={{
        backgroundColor: "#ffffff",
        borderTop: "1px solid #c1c8c7",
      }}
    >
      {TABS.map((tab) => {
        const isActive =
          "matchPrefix" in tab
            ? pathname.startsWith(tab.matchPrefix)
            : pathname === tab.href || pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-0.5 flex-1 py-2 no-underline"
            style={{
              backgroundColor: isActive ? "#e4e3db" : "transparent",
              borderRadius: "0.5rem",
              margin: "0 4px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "22px",
                color: isActive ? "#161d1d" : "#414848",
                fontVariationSettings: isActive
                  ? "'FILL' 1, 'wght' 400"
                  : "'FILL' 0, 'wght' 400",
              }}
            >
              {tab.iconOutlined}
            </span>
            <span
              className="text-[10px] leading-none"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: isActive ? "#161d1d" : "#414848",
                fontWeight: isActive ? 700 : 400,
              }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
