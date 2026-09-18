import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import SearchBox from "@/components/SearchBox";
import { listListings } from "@/lib/db";
import { LISTING_STATUSES } from "@/lib/constants";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const listings = listListings(q, status);

  return (
    <main className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-navy">Listings</h2>
        <div className="flex gap-2">
          <Link href="/listings/import" className="btn-ghost">
            Import CSV
          </Link>
          <Link href="/listings/new" className="btn-primary">
            Add listing
          </Link>
        </div>
      </div>
      <SearchBox
        action="/listings"
        placeholder="Search address, neighborhood, amenities…"
        defaultValue={q}
        extra={
          <select name="status" defaultValue={status} className="field sm:max-w-44">
            <option value="">All statuses</option>
            {LISTING_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        }
      />
      {listings.length ? (
        <div className="grid gap-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} href={`/listings/${listing.id}`} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center text-ink/60">No listings found. Add one or import a CSV.</div>
      )}
    </main>
  );
}
