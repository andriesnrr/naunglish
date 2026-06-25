import Link from "next/link"

export default function Header() {
  return (
    <header
      className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14"
      style={{
        backgroundColor: "#051f1f",
        borderBottom: "1px solid #c1c8c7",
      }}
    >
      <Link href="/dashboard" className="flex items-center gap-2 no-underline">
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: "24px" }}
        >
          menu_book
        </span>
        <span
          className="text-white text-xl font-bold"
          style={{ fontFamily: "Source Serif 4, serif" }}
        >
          Naunglish
        </span>
      </Link>

      <Link
        href="/profile"
        className="flex items-center justify-center w-9 h-9 rounded-full no-underline transition-colors hover:bg-white/10"
        aria-label="Profile"
      >
        <span className="material-symbols-outlined text-white" style={{ fontSize: "22px" }}>
          account_circle
        </span>
      </Link>
    </header>
  )
}
