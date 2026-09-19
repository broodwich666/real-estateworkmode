import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { listClients, listMatchesForClient } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export default function MatchesPage() {
  const clients = listClients("", "client");
  const rows = clients.flatMap((client) =>
    listMatchesForClient(client.id).map((match) => ({ client, match }))
  );

  return (
    <main>
      <PageHeader title="Matches" sub="Saved listing options worth sending to a client." />
      {rows.length ? (
        <div className="card overflow-hidden">
          <div className="card-head">Saved matches</div>
          <div>
            {rows.map(({ client, match }) => (
              <Link
                key={match.id}
                href={`/clients/${client.id}`}
                className="block border-b border-line px-4 py-3.5 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium">{match.listing.address}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {client.name} · {formatMoney(match.listing.price)}
                      {match.listing.neighborhood ? ` · ${match.listing.neighborhood}` : ""}
                      {match.listing.source ? ` · ${match.listing.source}` : ""}
                    </p>
                    {match.notes ? <p className="mt-1 text-xs text-muted">{match.notes}</p> : null}
                  </div>
                  <span className="pill pill-ok">Saved</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center text-sm text-muted">
          No saved matches yet. Open a client and save listings from Find matches.
        </div>
      )}
    </main>
  );
}
