import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmDelete from "@/components/ConfirmDelete";
import MatchResults from "@/components/MatchResults";
import { deleteClientAction } from "@/app/actions";
import { getClient, listListings, listMatchesForClient } from "@/lib/db";
import { formatBaths, formatBeds, formatDate, formatMoney } from "@/lib/format";
import { findMatches } from "@/lib/match";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClient(Number(id));
  if (!client) notFound();

  const saved = listMatchesForClient(client.id);
  const results = findMatches(
    client,
    listListings(),
    saved.map((row) => ({ listing_id: row.listing_id, id: row.id, notes: row.notes }))
  );

  return (
    <main className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-clay">Client</p>
          <h2 className="font-display text-3xl text-navy">{client.name}</h2>
        </div>
        <Link href={`/clients/${client.id}/edit`} className="btn-ghost">
          Edit
        </Link>
      </div>

      <section className="card p-5">
        <h3 className="font-display text-xl text-navy">Search criteria</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Fact label="Budget" value={formatMoney(client.budget_max)} />
          <Fact label="Beds / baths" value={`${formatBeds(client.beds_min)}+ · ${formatBaths(client.baths_min)}+`} />
          <Fact label="Neighborhoods" value={client.neighborhoods.join(", ") || "Any"} />
          <Fact label="Pets" value={client.pets ? "Needs pet-friendly" : "No pet requirement"} />
          <Fact label="Move-in" value={formatDate(client.move_in_date)} />
          <Fact label="Contact" value={[client.phone, client.email].filter(Boolean).join(" · ") || "—"} />
        </dl>
        {client.must_haves.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {client.must_haves.map((item) => (
              <span key={item} className="chip">
                Must have: {item}
              </span>
            ))}
          </div>
        ) : null}
        {client.notes ? <p className="mt-4 text-sm leading-6 text-ink/70">{client.notes}</p> : null}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="font-display text-2xl text-navy">Find matches</h3>
          <p className="text-sm text-ink/60">
            {results.length} available listing{results.length === 1 ? "" : "s"} ranked against this client. Save the
            ones worth sending.
          </p>
        </div>
        <MatchResults client={client} results={results} />
      </section>

      <ConfirmDelete
        action={deleteClientAction}
        id={client.id}
        label="Delete client"
        message="Delete this client and their saved matches?"
      />
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">{label}</dt>
      <dd className="mt-1 text-navy">{value}</dd>
    </div>
  );
}
