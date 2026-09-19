import { notFound } from "next/navigation";
import ClientForm from "@/components/ClientForm";
import PageHeader from "@/components/PageHeader";
import { updateClientAction } from "@/app/actions";
import { getClient } from "@/lib/db";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const client = getClient(Number((await params).id));
  if (!client) notFound();

  return (
    <main>
      <PageHeader title={`Edit ${client.name}`} />
      <ClientForm client={client} action={updateClientAction} submitLabel="Update client" />
    </main>
  );
}
