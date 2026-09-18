import { notFound } from "next/navigation";
import ListingForm from "@/components/ListingForm";
import { updateListingAction } from "@/app/actions";
import { getListing } from "@/lib/db";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const listing = getListing(Number((await params).id));
  if (!listing) notFound();

  return (
    <main className="space-y-4">
      <h2 className="font-display text-2xl text-navy">Edit listing</h2>
      <ListingForm listing={listing} action={updateListingAction} submitLabel="Update listing" />
    </main>
  );
}
