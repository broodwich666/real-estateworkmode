import { listSources } from "@/lib/db";

function statusClass(status: string) {
  if (status === "ready") return "chip bg-moss/15 text-moss";
  if (status === "never") return "chip bg-red-100 text-red-800";
  return "chip bg-clay/15 text-clay";
}

export default function SourcesPage() {
  const sources = listSources();

  return (
    <main className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-navy">Sources</h2>
        <p className="mt-1 text-sm text-ink/65">
          Inventory comes from manual entry, CSV, or a future licensed feed. Open datasets can enrich tax lots later.
          This app does not scrape StreetEasy, Zillow, Craigslist, OneKey, or Maps.
        </p>
      </div>
      <div className="grid gap-3">
        {sources.map((source) => (
          <article key={source.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-display text-xl text-navy">{source.name}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="chip">{source.kind}</span>
                <span className={statusClass(source.status)}>{source.status}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-ink/70">{source.notes}</p>
          </article>
        ))}
      </div>
    </main>
  );
}