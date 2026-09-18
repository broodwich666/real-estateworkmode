import { MUST_HAVES, NEIGHBORHOODS, PERSON_STATUSES, PERSON_TYPES } from "@/lib/constants";
import type { Client } from "@/lib/types";

export default function ClientForm({
  client,
  action,
  submitLabel,
}: {
  client?: Client;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const selectedNeighborhoods = new Set(client?.neighborhoods ?? []);
  const selectedMustHaves = new Set((client?.must_haves ?? []).map((item) => item.toLowerCase()));
  const extraMustHaves = (client?.must_haves ?? []).filter(
    (item) => !MUST_HAVES.includes(item.toLowerCase() as (typeof MUST_HAVES)[number])
  );

  return (
    <form action={action} className="card space-y-5 p-5">
      {client ? <input type="hidden" name="id" value={client.id} /> : null}

      <div>
        <label className="label" htmlFor="name">
          Name
        </label>
        <input id="name" name="name" className="field" required defaultValue={client?.name} placeholder="Name" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="type">
            Type
          </label>
          <select id="type" name="type" className="field" defaultValue={client?.type ?? "client"}>
            {PERSON_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" className="field" defaultValue={client?.status ?? "active"}>
            {PERSON_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="company">
            Company
          </label>
          <input id="company" name="company" className="field" defaultValue={client?.company} placeholder="Optional" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input id="phone" name="phone" className="field" defaultValue={client?.phone} inputMode="tel" />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className="field" defaultValue={client?.email} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="budget_max">
            Max rent
          </label>
          <input
            id="budget_max"
            name="budget_max"
            className="field"
            type="number"
            min="0"
            defaultValue={client?.budget_max ?? ""}
            placeholder="3500"
          />
        </div>
        <div>
          <label className="label" htmlFor="beds_min">
            Min beds
          </label>
          <input
            id="beds_min"
            name="beds_min"
            className="field"
            type="number"
            min="0"
            step="0.5"
            defaultValue={client?.beds_min ?? 1}
          />
          <p className="mt-1 text-xs text-ink/50">Use 0 for studio.</p>
        </div>
        <div>
          <label className="label" htmlFor="baths_min">
            Min baths
          </label>
          <input
            id="baths_min"
            name="baths_min"
            className="field"
            type="number"
            min="0"
            step="0.5"
            defaultValue={client?.baths_min ?? 1}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="move_in_date">
            Move-in date
          </label>
          <input id="move_in_date" name="move_in_date" type="date" className="field" defaultValue={client?.move_in_date} />
        </div>
        <label className="flex items-end gap-3 rounded-xl border border-line bg-paper px-3 py-3">
          <input type="checkbox" name="pets" value="true" defaultChecked={client?.pets} className="h-5 w-5" />
          <span>
            <span className="block font-semibold text-navy">Needs pet-friendly</span>
            <span className="text-sm text-ink/60">Only show listings that allow pets</span>
          </span>
        </label>
      </div>

      <fieldset>
        <legend className="label">Neighborhoods</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {NEIGHBORHOODS.map((name) => (
            <label key={name} className="flex min-h-11 items-center gap-2 rounded-xl bg-paper px-3 text-sm">
              <input
                type="checkbox"
                name="neighborhoods"
                value={name}
                defaultChecked={selectedNeighborhoods.has(name)}
              />
              {name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Must-haves</legend>
        <div className="grid grid-cols-2 gap-2">
          {MUST_HAVES.map((name) => (
            <label key={name} className="flex min-h-11 items-center gap-2 rounded-xl bg-paper px-3 text-sm">
              <input
                type="checkbox"
                name="must_haves"
                value={name}
                defaultChecked={selectedMustHaves.has(name)}
              />
              {name}
            </label>
          ))}
        </div>
        <input
          name="must_haves_extra"
          className="field mt-3"
          placeholder="Other must-haves, comma-separated"
          defaultValue={extraMustHaves.join(", ")}
        />
      </fieldset>

      <div>
        <label className="label" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          className="field min-h-28"
          defaultValue={client?.notes}
          placeholder="For brokers, paste the source URL here."
        />
      </div>

      <button className="btn-primary w-full">{submitLabel}</button>
    </form>
  );
}