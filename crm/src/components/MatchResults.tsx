import { deleteMatchAction, saveMatchAction, updateMatchNotesAction } from "@/app/actions";
import ListingCard from "@/components/ListingCard";
import StatusPill from "@/components/StatusPill";
import { formatBeds, formatMoney } from "@/lib/format";
import type { Client, MatchResult } from "@/lib/types";

export default function MatchResults({ client, results }: { client: Client; results: MatchResult[] }) {
  if (!results.length) {
    return (
      <div className="card p-6 text-center text-[13px] text-muted">
        No available listings match {client.name}&apos;s criteria
        {client.budget_max ? ` (max ${formatMoney(client.budget_max)}` : ""}
        {client.beds_min ? `, ${formatBeds(client.beds_min)}+` : ""}
        {client.neighborhoods.length ? `, ${client.neighborhoods.join(" / ")}` : ""}
        {client.budget_max ? ")" : ""}.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <div key={result.listing.id}>
          <ListingCard
            listing={result.listing}
            href={`/listings/${result.listing.id}`}
            footer={
              <div className="mt-4 border-t border-line pt-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold tabular-nums">Match score {result.score}</p>
                  {result.saved ? <StatusPill status="saved" /> : null}
                </div>
                <ul className="space-y-1 text-xs leading-5 text-muted">
                  {result.reasons.map((reason) => (
                    <li key={reason}>+ {reason}</li>
                  ))}
                  {result.gaps.map((gap) => (
                    <li key={gap}>{gap}</li>
                  ))}
                </ul>
                {result.saved && result.matchId ? (
                  <div className="mt-3 grid gap-2">
                    <form action={updateMatchNotesAction} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input type="hidden" name="id" value={result.matchId} />
                      <input type="hidden" name="clientId" value={client.id} />
                      <input
                        name="notes"
                        className="field"
                        defaultValue={result.matchNotes}
                        placeholder="Tour notes, feedback…"
                      />
                      <button className="btn-ghost">Save notes</button>
                    </form>
                    <form action={deleteMatchAction}>
                      <input type="hidden" name="id" value={result.matchId} />
                      <input type="hidden" name="clientId" value={client.id} />
                      <button className="btn-danger w-full sm:w-auto">Remove match</button>
                    </form>
                  </div>
                ) : (
                  <form action={saveMatchAction} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input type="hidden" name="clientId" value={client.id} />
                    <input type="hidden" name="listingId" value={result.listing.id} />
                    <input name="notes" className="field" placeholder="Why this works, tour time…" />
                    <button className="btn-primary">Save match</button>
                  </form>
                )}
              </div>
            }
          />
        </div>
      ))}
    </div>
  );
}
