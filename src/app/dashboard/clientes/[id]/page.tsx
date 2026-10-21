import { notFound } from "next/navigation";

import { ClientForm } from "@/components/features/client-form";
import { verifySession } from "@/lib/auth";
import { getClientById } from "@/services/clients";

type Params = Promise<{ id: string }>;

export const instant = false;

export default async function ClientDetailPage({ params }: { params: Params }) {
  await verifySession();

  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">{client.name}</h1>
      <ClientForm
        clientId={client.id}
        initialData={{
          name: client.name,
          zipCode: client.zipCode ?? "",
          street: client.street ?? "",
          number: client.number ?? "",
          complement: client.complement ?? "",
          city: client.city ?? "",
          state: client.state ?? "",
          document: client.document ?? "",
          contact: client.contact ?? "",
          phone: client.phone ?? "",
          email: client.email ?? "",
          clientCode: client.clientCode ?? "",
        }}
      />
    </div>
  );
}
