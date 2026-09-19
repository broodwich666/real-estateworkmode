import PageHeader from "@/components/PageHeader";
import StatusPill from "@/components/StatusPill";
import { listSources } from "@/lib/db";

export default function SourcesPage() {
  const sources = listSources();

  return (
    <main>
      <PageHeader
        title="Sources"
        sub="Inventory comes from manual entry, CSV, or a future licensed feed. Open datasets can enrich tax lots later. This app does not scrape StreetEasy, Zillow, Craigslist, OneKey, or Maps."
      />
      <div className="card overflow-hidden">
        {sources.map((source) => (
          <article key={source.id} className="border-b border-line px-4 py-4 last:border-b-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-[13px] font-medium">{source.name}</h2>
              <div className="flex flex-wrap gap-2">
                <span className="pill">{source.kind}</span>
                <StatusPill status={source.status} />
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">{source.notes}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
