import ClientForm from "@/components/ClientForm";
import { createClientAction } from "@/app/actions";

export default function NewClientPage() {
  return (
    <main className="space-y-4">
      <h2 className="font-display text-2xl text-navy">New person</h2>
      <ClientForm action={createClientAction} submitLabel="Save person" />
    </main>
  );
}
