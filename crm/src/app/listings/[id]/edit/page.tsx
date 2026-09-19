import { notFound } from "next/navigation";
import ListingForm from "@/components/ListingForm";
import PageHeader from "@/components/PageHeader";
import { updateListingAction } from "@/app/actions";
import { getListing } from "@/lib/db";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const listing = getListing(Number((await params).id));
  if (!listing) notFound();

  return (
    <main>
      <PageHeader title="Edit listing" />
      <ListingForm listing={listing} action={updateListingAction} submitLabel="Update listing" />
    </main>
  );
}
