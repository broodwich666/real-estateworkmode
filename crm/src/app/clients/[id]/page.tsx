import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmDelete from "@/components/ConfirmDelete";
import MatchResults from "@/components/MatchResults";
import StatusPill from "@/components/StatusPill";
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
      <div className="page-header">
        <div>
          <p className="page-sub">{isBroker ? "Broker" : "Client"}</p>
          <h1 className="page-title">{client.name}</h1>
          {client.company ? <p className="page-sub">{client.company}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/clients/${client.id}/edit`} className="btn-ghost">
            Edit
          </Link>
        </div>
      </div>

      <section className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[13px] font-semibold">{isBroker ? "Contact" : "Search criteria"}</h2>
          <StatusPill status={client.status} />
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
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
              <span key={item} className="pill">
                Must have: {item}
              </span>
            ))}
          </div>
        ) : null}
        {sourceUrl ? (
          <p className="mt-4 text-[13px] leading-6">
            Source:{" "}
            <a className="break-all underline" href={sourceUrl} target="_blank" rel="noreferrer">
              {sourceUrl}
            </a>
          </p>
        ) : client.notes ? (
          <p className="mt-4 text-[13px] leading-6 text-muted">{client.notes}</p>
        ) : null}
      </section>

      {!isBroker ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-[13px] font-semibold">Find matches</h2>
            <p className="mt-1 text-[13px] text-muted">
              {results.length} available listing{results.length === 1 ? "" : "s"} ranked against this client. Save the
              ones worth sending.
            </p>
          </div>
          <MatchResults client={client} results={results} />
        </section>
      ) : (
        <p className="text-[13px] text-muted">Stored for reference only. This CRM does not send outreach.</p>
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
      <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{label}</dt>
      <dd className="mt-1 text-[13px]">{value}</dd>
    </div>
  );
}
