import ListingForm from "@/components/ListingForm";
import PageHeader from "@/components/PageHeader";
import { createListingAction } from "@/app/actions";

export default function NewListingPage() {
  return (
    <main>
      <PageHeader title="New listing" sub="Enter a unit by hand. Lot fields stay off this form." />
      <ListingForm action={createListingAction} submitLabel="Save listing" />
    </main>
  );
}
