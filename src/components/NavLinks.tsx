"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/projects", label: "Projects" },
  { href: "/assistant", label: "Research assistant" },
  { href: "/crm", label: "CRM" },
];

export function NavLinks() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
      {NAV.map((n) => {
        const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`whitespace-nowrap rounded px-3 py-2 text-sm ${active ? "bg-accent text-white" : "text-foreground hover:bg-background"}`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
