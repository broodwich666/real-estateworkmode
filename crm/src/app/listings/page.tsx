import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import PageHeader from "@/components/PageHeader";
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
    <main>
      <PageHeader title="Listings" sub="Manual entries, CSV imports, and licensed-feed inventory.">
        <Link href="/listings/import" className="btn-ghost">
          Import CSV
        </Link>
        <Link href="/listings/new" className="btn-primary">
          New listing
        </Link>
      </PageHeader>
      <div className="mb-4">
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
      </div>
      {listings.length ? (
        <div className="grid gap-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} href={`/listings/${listing.id}`} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center text-sm text-muted">No listings found. Add one or import a CSV.</div>
      )}
    </main>
  );
}
