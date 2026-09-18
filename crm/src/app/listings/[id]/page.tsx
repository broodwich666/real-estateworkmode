import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmDelete from "@/components/ConfirmDelete";
import { deleteListingAction } from "@/app/actions";
import { getListing } from "@/lib/db";
import { formatBaths, formatBeds, formatDate, formatMoney, titleCaseStatus } from "@/lib/format";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const listing = getListing(Number((await params).id));
  if (!listing) notFound();

  return (
    <main className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-clay">{listing.neighborhood || "NYC"}</p>
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

      <ConfirmDelete
        action={deleteListingAction}
        id={listing.id}
        label="Delete listing"
        message="Delete this listing and any saved matches?"
      />
    </main>
  );
}
