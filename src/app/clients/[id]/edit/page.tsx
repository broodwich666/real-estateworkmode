import { notFound } from "next/navigation";
import ClientForm from "@/components/ClientForm";
import { updateClientAction } from "@/app/actions";
import { getClient } from "@/lib/db";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const client = getClient(Number((await params).id));
  if (!client) notFound();

  return (
    <main className="space-y-4">
      <h2 className="font-display text-2xl text-navy">Edit {client.name}</h2>
      <ClientForm client={client} action={updateClientAction} submitLabel="Update client" />
    </main>
  );
}
