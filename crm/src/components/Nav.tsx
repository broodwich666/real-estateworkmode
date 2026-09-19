"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const tabs = [
  { href: "/clients", label: "Clients" },
  { href: "/listings", label: "Listings" },
  { href: "/matches", label: "Matches" },
  { href: "/clients?type=broker", label: "Brokers" },
  { href: "/sources", label: "Sources" },
];

function NavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  function active(href: string) {
    if (href === "/matches") return pathname.startsWith("/matches");
    if (href === "/listings") return pathname.startsWith("/listings");
    if (href === "/sources") return pathname.startsWith("/sources");
    if (href.startsWith("/clients?type=broker")) {
      return pathname.startsWith("/clients") && type === "broker";
    }
    return pathname === "/" || (pathname.startsWith("/clients") && type !== "broker");
  }

  return (
    <>
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} className={`nav-item ${active(tab.href) ? "active" : ""}`}>
          {tab.label}
        </Link>
      ))}
    </>
  );
}

export default function Nav() {
  return (
    <nav className="app-nav">
      <Link href="/" className="brand">
        Match CRM
      </Link>
      <Suspense
        fallback={
          <>
            {tabs.map((tab) => (
              <span key={tab.href} className="nav-item">
                {tab.label}
              </span>
            ))}
          </>
        }
      >
        <NavLinks />
      </Suspense>
    </nav>
  );
}
