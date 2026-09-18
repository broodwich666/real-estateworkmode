import Link from "next/link";
import { stats, listClients, listListings } from "@/lib/db";
import { formatBeds, formatMoney } from "@/lib/format";

export default function HomePage() {
  const counts = stats();
  const clients = listClients().slice(0, 4);
  const listings = listListings("", "available").slice(0, 4);

  return (
    <main className="space-y-6">
      <section className="card bg-navy p-5 text-white">
        <p className="text-sm text-white/70">Agent workspace</p>
        <h2 className="mt-1 font-display text-3xl">Find the apartment that fits.</h2>
        <p className="mt-2 max-w-xl text-white/80">
          Keep every client and listing in one database. Cross-search by budget, beds, baths, neighborhood, and pets,
          then save the matches you want to send.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/clients/new" className="btn-accent">
            Add client
          </Link>
          <Link href="/listings/new" className="btn bg-white text-navy">
            Add listing
          </Link>
          <Link href="/listings/import" className="btn border border-white/30 text-white">
            Import CSV
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Clients" value={counts.clients} href="/clients" />
        <Stat label="Listings" value={counts.listings} href="/listings" />
        <Stat label="Available" value={counts.available} href="/listings?status=available" />
        <Stat label="Saved matches" value={counts.matches} href="/clients" />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl text-navy">Clients</h2>
          <Link href="/clients" className="text-sm font-bold text-clay">
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-navy">{client.name}</p>
                <p className="text-sm text-ink/60">
                  {formatMoney(client.budget_max)} · {formatBeds(client.beds_min)}+ ·{" "}
                  {client.neighborhoods.join(", ") || "Any neighborhood"}
                </p>
              </div>
              <span className="text-navy">›</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl text-navy">Available listings</h2>
          <Link href="/listings" className="text-sm font-bold text-clay">
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/listings/${listing.id}`} className="card p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-clay">{listing.neighborhood}</p>
              <p className="font-semibold text-navy">{listing.address}</p>
              <p className="text-sm text-ink/60">
                {formatMoney(listing.price)} · {formatBeds(listing.beds)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 font-display text-3xl text-navy">{value}</p>
    </Link>
  );
}
