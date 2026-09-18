import Link from "next/link";
import { formatBaths, formatBeds, formatMoney, titleCaseStatus } from "@/lib/format";
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
          <p className="text-xs font-bold uppercase tracking-wide text-clay">{listing.neighborhood || "NYC"}</p>
          <h3 className="mt-1 font-display text-xl font-semibold leading-snug text-navy">{listing.address}</h3>
        </div>
        <p className="shrink-0 font-display text-xl font-semibold text-navy">{formatMoney(listing.price)}</p>
      </div>
      <p className="mt-2 text-sm text-ink/70">
        {formatBeds(listing.beds)} · {formatBaths(listing.baths)} · {listing.pets_allowed ? "Pets ok" : "No pets"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="chip">{titleCaseStatus(listing.status)}</span>
        {listing.source ? <span className="chip">{listing.source}</span> : null}
        {listing.amenities.slice(0, 4).map((item) => (
          <span key={item} className="chip">
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
