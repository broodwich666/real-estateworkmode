"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/clients", label: "People", icon: "◉" },
  { href: "/listings", label: "Listings", icon: "▣" },
  { href: "/sources", label: "Sources", icon: "☰" },
];

export default function Nav() {
  const pathname = usePathname();

  function active(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-5xl -translate-x-1/2 border-t border-line bg-[rgba(243,239,230,0.96)] px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div className="grid grid-cols-4 gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex min-h-12 flex-col items-center justify-center rounded-xl text-xs font-bold ${
              active(tab.href) ? "bg-navy text-white" : "text-ink/60"
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span className="mt-1">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}