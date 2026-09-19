import Link from "next/link";
import StatusPill from "@/components/StatusPill";
import { formatBaths, formatBeds, formatMoney } from "@/lib/format";
import type { Listing } from "@/lib/types";

export default function ListingCard({
  listing,
  href,
  footer,
}: {
  listing: Listing;
  href?: string;
  footer?: React.ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
            {listing.neighborhood || "NYC"}
          </p>
          <h3 className="mt-1 text-[13px] font-medium leading-snug">{listing.address}</h3>
        </div>
        <p className="shrink-0 text-[13px] font-semibold tabular-nums">{formatMoney(listing.price)}</p>
      </div>
      <p className="mt-2 text-xs text-muted">
        {formatBeds(listing.beds)} · {formatBaths(listing.baths)} · {listing.pets_allowed ? "Pets ok" : "No pets"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusPill status={listing.status} />
        {listing.source ? <span className="pill">{listing.source}</span> : null}
        {listing.amenities.slice(0, 4).map((item) => (
          <span key={item} className="pill">
            {item}
          </span>
        ))}
      </div>
    </>
  );

  return (
    <article className="card p-4">
      {href ? (
        <Link href={href} className="block">
          {body}
        </Link>
      ) : (
        body
      )}
      {footer}
    </article>
  );
}
