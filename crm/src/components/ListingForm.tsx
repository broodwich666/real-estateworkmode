import { LISTING_SOURCES, LISTING_STATUSES, MUST_HAVES, NEIGHBORHOODS } from "@/lib/constants";
import type { Listing } from "@/lib/types";

export default function ListingForm({
  listing,
  action,
  submitLabel,
}: {
  listing?: Listing;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const selectedAmenities = new Set((listing?.amenities ?? []).map((item) => item.toLowerCase()));
  const extraAmenities = (listing?.amenities ?? []).filter(
    (item) => !MUST_HAVES.includes(item.toLowerCase() as (typeof MUST_HAVES)[number])
  );

  return (
    <form action={action} className="card space-y-5 p-5">
      {listing ? <input type="hidden" name="id" value={listing.id} /> : null}

      <div>
        <label className="label" htmlFor="address">
          Address
        </label>
        <input
          id="address"
          name="address"
          className="field"
          required
          defaultValue={listing?.address}
          placeholder="184 N 8th Street #3L, Brooklyn, NY"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="neighborhood">
            Neighborhood
          </label>
          <input
            id="neighborhood"
            name="neighborhood"
            className="field"
            list="neighborhoods"
            defaultValue={listing?.neighborhood}
          />
          <datalist id="neighborhoods">
            {NEIGHBORHOODS.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" className="field" defaultValue={listing?.status ?? "available"}>
            {LISTING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="price">
            Monthly rent
          </label>
          <input id="price" name="price" className="field" type="number" min="0" defaultValue={listing?.price ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="beds">
            Beds
          </label>
          <input
            id="beds"
            name="beds"
            className="field"
            type="number"
            min="0"
            step="0.5"
            defaultValue={listing?.beds ?? 1}
          />
        </div>
        <div>
          <label className="label" htmlFor="baths">
            Baths
          </label>
          <input
            id="baths"
            name="baths"
            className="field"
            type="number"
            min="0"
            step="0.5"
            defaultValue={listing?.baths ?? 1}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="source">
            Source
          </label>
          <input
            id="source"
            name="source"
            className="field"
            list="sources"
            defaultValue={listing?.source ?? "manual"}
          />
          <datalist id="sources">
            {LISTING_SOURCES.map((source) => (
              <option key={source} value={source} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="external_id">
            External ID
          </label>
          <input id="external_id" name="external_id" className="field" defaultValue={listing?.external_id} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="url">
            URL
          </label>
          <input id="url" name="url" className="field" defaultValue={listing?.url} placeholder="https://" />
        </div>
        <div>
          <label className="label" htmlFor="pulled_at">
            Pulled at
          </label>
          <input id="pulled_at" name="pulled_at" type="date" className="field" defaultValue={listing?.pulled_at} />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3 py-3">
        <input type="checkbox" name="pets_allowed" value="true" defaultChecked={listing?.pets_allowed} className="h-5 w-5" />
        <span className="font-semibold text-navy">Pets allowed</span>
      </label>

      <fieldset>
        <legend className="label">Amenities</legend>
        <div className="grid grid-cols-2 gap-2">
          {MUST_HAVES.map((name) => (
            <label key={name} className="flex min-h-11 items-center gap-2 rounded-xl bg-paper px-3 text-sm">
              <input type="checkbox" name="amenities" value={name} defaultChecked={selectedAmenities.has(name)} />
              {name}
            </label>
          ))}
        </div>
        <input
          name="amenities_extra"
          className="field mt-3"
          placeholder="Other amenities, comma-separated"
          defaultValue={extraAmenities.join(", ")}
        />
      </fieldset>

      <div>
        <label className="label" htmlFor="notes">
          Notes
        </label>
        <textarea id="notes" name="notes" className="field min-h-28" defaultValue={listing?.notes} />
      </div>

      <button className="btn-primary w-full">{submitLabel}</button>
    </form>
  );
}
