"use client"

import { usePathname } from "next/navigation"
import Header from "./Header"
import BottomNav from "./BottomNav"
import DesktopSidebar from "./DesktopSidebar"

const SHELL_HIDDEN_PREFIXES = ["/onboarding", "/tutor", "/mock-test", "/login"]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideShell = SHELL_HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))

  return (
    <>
      {!hideShell && <Header />}
      <div className="flex">
        {!hideShell && <DesktopSidebar />}
        <main className={`flex-1 ${!hideShell ? "pb-16 md:pb-0 md:ml-56" : ""}`}>
          {children}
        </main>
      </div>
      {!hideShell && <BottomNav />}
    </>
  )
}
