import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmDelete from "@/components/ConfirmDelete";
import MatchResults from "@/components/MatchResults";
import { deleteClientAction } from "@/app/actions";
import { getClient, listListings, listMatchesForClient } from "@/lib/db";
import { formatBaths, formatBeds, formatDate, formatMoney } from "@/lib/format";
import { findMatches } from "@/lib/match";

function noteUrl(notes: string): string | null {
  const match = notes.match(/https?:\/\/\S+/i);
  return match ? match[0] : null;
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClient(Number(id));
  if (!client) notFound();

  const isBroker = client.type === "broker";
  const sourceUrl = noteUrl(client.notes);
  const saved = isBroker ? [] : listMatchesForClient(client.id);
  const results = isBroker
    ? []
    : findMatches(
        client,
        listListings(),
        saved.map((row) => ({ listing_id: row.listing_id, id: row.id, notes: row.notes }))
      );

  return (
    <main className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-clay">{isBroker ? "Broker" : "Client"}</p>
          <h2 className="font-display text-3xl text-navy">{client.name}</h2>
          {client.company ? <p className="mt-1 text-ink/65">{client.company}</p> : null}
        </div>
        <Link href={`/clients/${client.id}/edit`} className="btn-ghost">
          Edit
        </Link>
      </div>

      <section className="card p-5">
        <h3 className="font-display text-xl text-navy">{isBroker ? "Contact" : "Search criteria"}</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Fact label="Type" value={client.type} />
          <Fact label="Status" value={client.status} />
          <Fact label="Phone" value={client.phone || "—"} />
          <Fact label="Email" value={client.email || "—"} />
          {!isBroker ? (
            <>
              <Fact label="Budget" value={formatMoney(client.budget_max)} />
              <Fact
                label="Beds / baths"
                value={`${formatBeds(client.beds_min)}+ · ${formatBaths(client.baths_min)}+`}
              />
              <Fact label="Neighborhoods" value={client.neighborhoods.join(", ") || "Any"} />
              <Fact label="Pets" value={client.pets ? "Needs pet-friendly" : "No pet requirement"} />
              <Fact label="Move-in" value={formatDate(client.move_in_date)} />
            </>
          ) : null}
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
        {sourceUrl ? (
          <p className="mt-4 text-sm leading-6">
            Source:{" "}
            <a className="break-all font-bold text-clay" href={sourceUrl} target="_blank" rel="noreferrer">
              {sourceUrl}
            </a>
          </p>
        ) : client.notes ? (
          <p className="mt-4 text-sm leading-6 text-ink/70">{client.notes}</p>
        ) : null}
      </section>

      {!isBroker ? (
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
      ) : (
        <p className="text-sm text-ink/55">Stored for reference only. This CRM does not send outreach.</p>
      )}

      <ConfirmDelete
        action={deleteClientAction}
        id={client.id}
        label={isBroker ? "Delete broker" : "Delete client"}
        message={isBroker ? "Delete this broker?" : "Delete this client and their saved matches?"}
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