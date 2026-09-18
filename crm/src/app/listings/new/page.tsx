import ListingForm from "@/components/ListingForm";
import { createListingAction } from "@/app/actions";

export default function NewListingPage() {
  return (
    <main className="space-y-4">
      <h2 className="font-display text-2xl text-navy">New listing</h2>
      <ListingForm action={createListingAction} submitLabel="Save listing" />
    </main>
  );
}
