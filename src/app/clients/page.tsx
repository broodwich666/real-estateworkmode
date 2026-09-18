import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import { listClients } from "@/lib/db";
import { formatBeds, formatDate, formatMoney } from "@/lib/format";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const clients = listClients(q);

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-navy">Clients</h2>
        <Link href="/clients/new" className="btn-primary">
          Add client
        </Link>
      </div>
      <SearchBox action="/clients" placeholder="Search name, neighborhood, notes…" defaultValue={q} />
      {clients.length ? (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl text-navy">{client.name}</h3>
                  <p className="mt-1 text-sm text-ink/65">
                    {formatMoney(client.budget_max)} max · {formatBeds(client.beds_min)}+ · {client.baths_min}+ bath
                  </p>
                </div>
                <span className="text-navy">›</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(client.neighborhoods.length ? client.neighborhoods : ["Any neighborhood"]).map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
                {client.pets ? <span className="chip">Pets</span> : null}
                {client.move_in_date ? <span className="chip">Move-in {formatDate(client.move_in_date)}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center text-ink/60">No clients yet. Add one to start matching.</div>
      )}
    </main>
  );
}
