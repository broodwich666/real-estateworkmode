"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }

  return (
    <header className="flex flex-col gap-5 rounded-3xl border border-line bg-ink px-5 py-5 text-card shadow-card sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-clay">Zad · Data Hub</p>
        <Link href="/" className="font-display text-3xl tracking-tight">
          Portal
        </Link>
        <p className="mt-1 max-w-md text-sm text-card/70">
          Structured records across Real Estate and every other project — not Work Mode, not the matcher CRM.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
        <nav className="flex gap-4 text-sm">
          <Link className="hover:text-clay" href="/">
            Projects
          </Link>
          <Link className="hover:text-clay" href="/search">
            Search
          </Link>
        </nav>
        <form onSubmit={onSearch} className="flex w-full gap-2 sm:w-[22rem]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search every project"
            className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-card outline-none placeholder:text-card/50 focus:border-clay"
          />
          <button
            type="submit"
            className="rounded-full bg-clay px-4 py-2 text-sm font-medium text-ink hover:bg-amber-400"
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}
