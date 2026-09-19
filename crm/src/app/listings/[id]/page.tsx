import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmDelete from "@/components/ConfirmDelete";
import PlutoEnrichButton from "@/components/PlutoEnrichButton";
import StatusPill from "@/components/StatusPill";
import { deleteListingAction } from "@/app/actions";
import { getListing } from "@/lib/db";
import { dash, formatBaths, formatBeds, formatDate, formatMoney, trimNumber } from "@/lib/format";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const listing = getListing(Number((await params).id));
  if (!listing) notFound();

  const coords =
    listing.latitude != null && listing.longitude != null
      ? `${trimNumber(listing.latitude)}, ${trimNumber(listing.longitude)}`
      : "";

  return (
    <main className="space-y-5">
      <div className="page-header">
        <div>
          <p className="page-sub">{[listing.neighborhood, listing.borough].filter(Boolean).join(" · ") || "NYC"}</p>
          <h1 className="page-title">{listing.address}</h1>
          <p className="page-sub">
            {formatMoney(listing.price)} · {formatBeds(listing.beds)} · {formatBaths(listing.baths)}
          </p>
        </div>
        <Link href={`/listings/${listing.id}/edit`} className="btn-ghost">
          Edit
        </Link>
      </div>

      <section className="card space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <StatusPill status={listing.status} />
          <span className="pill">{listing.pets_allowed ? "Pets allowed" : "No pets"}</span>
          <span className="pill">{listing.source || "manual"}</span>
          {listing.external_id ? <span className="pill">ID {listing.external_id}</span> : null}
          {listing.bbl ? <span className="pill">BBL {listing.bbl}</span> : null}
        </div>
        {listing.amenities.length ? (
          <div className="flex flex-wrap gap-2">
            {listing.amenities.map((item) => (
              <span key={item} className="pill">
                {item}
              </span>
            ))}
          </div>
        ) : null}
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Pulled at</dt>
            <dd className="mt-1 text-[13px]">{formatDate(listing.pulled_at)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">URL</dt>
            <dd className="mt-1 text-[13px]">
              {listing.url ? (
                <a className="break-all underline" href={listing.url} target="_blank" rel="noreferrer">
                  {listing.url}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
        {listing.notes ? <p className="text-[13px] leading-6 text-muted">{listing.notes}</p> : null}
      </section>

      <section className="card space-y-4 p-5">
        <div>
          <h2 className="text-[13px] font-semibold">PLUTO tax lot</h2>
          <p className="mt-1 text-[13px] text-muted">
            Official NYC Open Data (dataset 64uk-42ks), one lot. Fills lot columns only — never rent, beds, baths,
            status, URL, pets, or pulled date.
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Fact label="BBL" value={dash(listing.bbl)} />
          <Fact label="Borough" value={dash(listing.borough)} />
          <Fact label="Residential units" value={dash(listing.units_res)} />
          <Fact label="Year built" value={dash(listing.year_built)} />
          <Fact label="Floors" value={dash(listing.num_floors)} />
          <Fact label="Building class" value={dash(listing.bldg_class)} />
          <Fact label="Zoning" value={dash(listing.zone_dist)} />
          <Fact label="Owner" value={dash(listing.owner_name)} />
          <div className="sm:col-span-2">
            <Fact label="Latitude / longitude" value={coords || "—"} />
          </div>
          <div className="sm:col-span-2">
            <Fact label="Enriched at" value={dash(listing.pluto_enriched_at)} />
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{label}</dt>
      <dd className="mt-1 text-[13px]">{value}</dd>
    </div>
  );
}
