import ClientForm from "@/components/ClientForm";
import PageHeader from "@/components/PageHeader";
import { createClientAction } from "@/app/actions";

export default function NewClientPage() {
  return (
    <main>
      <PageHeader title="New person" sub="Add a client or broker to the local database." />
      <ClientForm action={createClientAction} submitLabel="Save person" />
    </main>
  );
}
