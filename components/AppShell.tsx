"use client"

import { usePathname } from "next/navigation"
import Header from "./Header"
import BottomNav from "./BottomNav"

// Routes where Header + BottomNav are hidden
const SHELL_HIDDEN_PREFIXES = ["/onboarding", "/tutor", "/mock-test", "/login"]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideShell = SHELL_HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))

  return (
    <>
      {!hideShell && <Header />}
      <main className={`flex-1 ${!hideShell ? "pb-16 md:pb-0" : ""}`}>
        {children}
      </main>
      {!hideShell && <BottomNav />}
    </>
  )
}
