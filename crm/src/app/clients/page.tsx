import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SearchBox from "@/components/SearchBox";
import StatusPill from "@/components/StatusPill";
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
  const title = type === "broker" ? "Brokers" : type === "client" ? "Clients" : "People";

  return (
    <main>
      <PageHeader title={title} sub="Clients and brokers in the local database.">
        <Link href="/clients/new" className="btn-primary">
          New client
        </Link>
      </PageHeader>
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
      <div className="mb-4 mt-4 flex flex-wrap gap-2">
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
        <div className="card overflow-x-auto">
          <div className="card-head">
            People
            <span className="pill">All · Clients · Brokers</span>
          </div>
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
                    {person.type === "broker" ? (
                      <p className="mt-1 text-xs text-muted">
                        {[person.company, person.phone].filter(Boolean).join(" · ") || "Broker"}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-muted">
                        {formatBeds(person.beds_min)}+
                        {person.neighborhoods.length ? ` · ${person.neighborhoods.join(", ")}` : ""}
                        {person.pets ? " · Pets" : ""}
                        {person.move_in_date ? ` · Move-in ${formatDate(person.move_in_date)}` : ""}
                      </p>
                    )}
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
        </div>
      ) : (
        <div className="card p-8 text-center text-sm text-muted">No people found.</div>
      )}
    </main>
  );
}
