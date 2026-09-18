import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmDelete from "@/components/ConfirmDelete";
import PlutoEnrichButton from "@/components/PlutoEnrichButton";
import { deleteListingAction } from "@/app/actions";
import { getListing } from "@/lib/db";
import { dash, formatBaths, formatBeds, formatDate, formatMoney, titleCaseStatus, trimNumber } from "@/lib/format";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const listing = getListing(Number((await params).id));
  if (!listing) notFound();

  const coords =
    listing.latitude != null && listing.longitude != null
      ? `${trimNumber(listing.latitude)}, ${trimNumber(listing.longitude)}`
      : "";

  return (
    <main className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-clay">
            {[listing.neighborhood, listing.borough].filter(Boolean).join(" · ") || "NYC"}
          </p>
          <h2 className="font-display text-3xl text-navy">{listing.address}</h2>
          <p className="mt-2 text-lg text-navy">
            {formatMoney(listing.price)} · {formatBeds(listing.beds)} · {formatBaths(listing.baths)}
          </p>
        </div>
        <Link href={`/listings/${listing.id}/edit`} className="btn-ghost">
          Edit
        </Link>
      </div>

      <section className="card space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <span className="chip">{titleCaseStatus(listing.status)}</span>
          <span className="chip">{listing.pets_allowed ? "Pets allowed" : "No pets"}</span>
          <span className="chip">{listing.source || "manual"}</span>
          {listing.external_id ? <span className="chip">ID {listing.external_id}</span> : null}
          {listing.bbl ? <span className="chip">BBL {listing.bbl}</span> : null}
        </div>
        {listing.amenities.length ? (
          <div className="flex flex-wrap gap-2">
            {listing.amenities.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        ) : null}
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">Pulled at</dt>
            <dd>{formatDate(listing.pulled_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">URL</dt>
            <dd>
              {listing.url ? (
                <a className="font-bold text-clay break-all" href={listing.url} target="_blank" rel="noreferrer">
                  {listing.url}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
        {listing.notes ? <p className="text-sm leading-6 text-ink/70">{listing.notes}</p> : null}
      </section>

      <section className="card space-y-4 p-5">
        <div>
          <h3 className="font-display text-xl text-navy">PLUTO tax lot</h3>
          <p className="mt-1 text-sm text-ink/65">
            Official NYC Open Data (dataset 64uk-42ks), one lot. Fills lot columns only — never rent, beds, baths,
            status, URL, pets, or pulled date.
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">BBL</dt>
            <dd>{dash(listing.bbl)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">Borough</dt>
            <dd>{dash(listing.borough)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">Residential units</dt>
            <dd>{dash(listing.units_res)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">Year built</dt>
            <dd>{dash(listing.year_built)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">Floors</dt>
            <dd>{dash(listing.num_floors)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">Building class</dt>
            <dd>{dash(listing.bldg_class)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">Zoning</dt>
            <dd>{dash(listing.zone_dist)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">Owner</dt>
            <dd>{dash(listing.owner_name)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">Latitude / longitude</dt>
            <dd>{coords || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">Enriched at</dt>
            <dd>{dash(listing.pluto_enriched_at)}</dd>
          </div>
        </dl>
        <PlutoEnrichButton listingId={listing.id} />
      </section>

      <ConfirmDelete
        action={deleteListingAction}
        id={listing.id}
        label="Delete listing"
        message="Delete this listing and any saved matches?"
      />
    </main>
  );
}
