import Link from "next/link";
import { listSources, stats, listClients, listListings } from "@/lib/db";
import { formatBeds, formatMoney } from "@/lib/format";

export default function HomePage() {
  const counts = stats();
  const clients = listClients("", "client").slice(0, 4);
  const brokers = listClients("", "broker").slice(0, 4);
  const listings = listListings("", "available").slice(0, 4);
  const sources = listSources();

  return (
    <main className="space-y-6">
      <section className="card bg-navy p-5 text-white">
        <p className="text-sm text-white/70">Agent workspace</p>
        <h2 className="mt-1 font-display text-3xl">Find the apartment that fits.</h2>
        <p className="mt-2 max-w-xl text-white/80">
          Keep every client, broker, and listing in one database. Cross-search by budget, beds, baths, neighborhood, and
          pets, then save the matches you want to send.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/clients/new" className="btn-accent">
            Add person
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
        <Stat label="Clients" value={counts.clients} href="/clients?type=client" />
        <Stat label="Brokers" value={counts.brokers} href="/clients?type=broker" />
        <Stat label="Listings" value={counts.listings} href="/listings" />
        <Stat label="Sources" value={counts.sources} href="/sources" />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl text-navy">Clients</h2>
          <Link href="/clients?type=client" className="text-sm font-bold text-clay">
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
          <h2 className="font-display text-2xl text-navy">Brokers</h2>
          <Link href="/clients?type=broker" className="text-sm font-bold text-clay">
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {brokers.map((broker) => (
            <Link key={broker.id} href={`/clients/${broker.id}`} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-navy">{broker.name}</p>
                <p className="text-sm text-ink/60">{[broker.company, broker.phone].filter(Boolean).join(" · ")}</p>
              </div>
              <span className="text-navy">›</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl text-navy">Inventory sources</h2>
          <Link href="/sources" className="text-sm font-bold text-clay">
            View all
          </Link>
        </div>
        <div className="grid gap-2">
          {sources.map((source) => (
            <Link key={source.id} href="/sources" className="card flex items-center justify-between p-3">
              <span className="font-semibold text-navy">{source.name}</span>
              <span className="chip">
                {source.kind} · {source.status}
              </span>
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