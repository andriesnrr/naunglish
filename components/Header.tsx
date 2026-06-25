import Link from "next/link"

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 flex items-center px-4 h-14"
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
    </header>
  )
}
