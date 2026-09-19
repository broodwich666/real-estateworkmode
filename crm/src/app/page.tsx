import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusPill from "@/components/StatusPill";
import { listClients, listListings, listSources, stats } from "@/lib/db";
import { formatBeds, formatMoney } from "@/lib/format";

export default function HomePage() {
  const counts = stats();
  const people = [...listClients("", "client").slice(0, 4), ...listClients("", "broker").slice(0, 1)];
  const listings = listListings("", "available").slice(0, 3);
  const sources = listSources();

  return (
    <main>
      <PageHeader title="Clients" sub="NYC rental clients, listings, and saved matches.">
        <Link href="/listings/import" className="btn-ghost">
          Import CSV
        </Link>
        <Link href="/clients/new" className="btn-primary">
          New client
        </Link>
      </PageHeader>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Active clients" value={counts.clients} href="/clients?type=client" />
        <Stat label="Listings" value={counts.listings} href="/listings" />
        <Stat label="Saved matches" value={counts.matches} href="/matches" />
        <Stat label="Brokers" value={counts.brokers} href="/clients?type=broker" />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <section className="card overflow-x-auto">
          <div className="card-head">
            People
            <span className="pill">All · Clients · Brokers</span>
          </div>
          {people.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <Link href={`/clients/${person.id}`} className="font-medium">
                        {person.name}
                      </Link>
                    </td>
                    <td className="text-muted">{person.type === "broker" ? "Broker" : "Client"}</td>
                    <td className="text-muted">
                      {person.type === "broker" ? "—" : `≤ ${formatMoney(person.budget_max)}`}
                    </td>
                    <td>
                      <StatusPill status={person.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-muted">No people yet.</p>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="card-head">Available listings</div>
          {listings.length ? (
            <div>
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="block border-b border-line px-4 py-3.5 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-medium">
                        {listing.neighborhood || "NYC"} · {formatMoney(listing.price)}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {formatBeds(listing.beds)}
                        {listing.pets_allowed ? " · Pets ok" : ""}
                        {listing.source ? ` · ${listing.source}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-[13px] font-semibold tabular-nums">{formatBeds(listing.beds)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-muted">No available listings.</p>
          )}
        </section>
      </div>

      <section className="mt-4 card overflow-hidden">
        <div className="card-head">
          Sources
          <Link href="/sources" className="text-[13px] font-medium text-muted">
            View all
          </Link>
        </div>
        <div>
          {sources.map((source) => (
            <Link
              key={source.id}
              href="/sources"
              className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0"
            >
              <span className="text-[13px] font-medium">{source.name}</span>
              <StatusPill status={source.status} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card px-[18px] py-4">
      <p className="text-xs font-normal text-muted">{label}</p>
      <p className="mt-1.5 text-[28px] font-semibold tracking-[-0.03em]">{value}</p>
    </Link>
  );
}
