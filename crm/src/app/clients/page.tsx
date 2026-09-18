import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import { listClients } from "@/lib/db";
import { formatBeds, formatDate, formatMoney } from "@/lib/format";

const FILTERS = [
  { value: "", label: "All" },
  { value: "client", label: "Clients" },
  { value: "broker", label: "Brokers" },
];

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q = "", type = "" } = await searchParams;
  const people = listClients(q, type);

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-navy">People</h2>
        <Link href="/clients/new" className="btn-primary">
          Add person
        </Link>
      </div>
      <SearchBox
        action="/clients"
        placeholder="Search name, company, notes…"
        defaultValue={q}
        extra={
          <select name="type" defaultValue={type} className="field sm:max-w-44">
            {FILTERS.map((filter) => (
              <option key={filter.value || "all"} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        }
      />
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const href = filter.value ? `/clients?type=${filter.value}` : "/clients";
          const active = type === filter.value;
          return (
            <Link key={href} href={href} className={active ? "btn-primary" : "btn-ghost"}>
              {filter.label}
            </Link>
          );
        })}
      </div>
      {people.length ? (
        <div className="grid gap-3">
          {people.map((person) => (
            <Link key={person.id} href={`/clients/${person.id}`} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl text-navy">{person.name}</h3>
                  {person.type === "broker" ? (
                    <p className="mt-1 text-sm text-ink/65">
                      {[person.company, person.phone].filter(Boolean).join(" · ") || "Broker"}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-ink/65">
                      {formatMoney(person.budget_max)} max · {formatBeds(person.beds_min)}+ · {person.baths_min}+ bath
                    </p>
                  )}
                </div>
                <span className="text-navy">›</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="chip">{person.type}</span>
                <span className="chip">{person.status}</span>
                {person.type === "broker" ? (
                  person.email ? <span className="chip">{person.email}</span> : <span className="chip">No email</span>
                ) : (
                  <>
                    {(person.neighborhoods.length ? person.neighborhoods : ["Any neighborhood"]).map((item) => (
                      <span key={item} className="chip">
                        {item}
                      </span>
                    ))}
                    {person.pets ? <span className="chip">Pets</span> : null}
                    {person.move_in_date ? <span className="chip">Move-in {formatDate(person.move_in_date)}</span> : null}
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center text-ink/60">No people found.</div>
      )}
    </main>
  );
}