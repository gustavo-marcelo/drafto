import { ClientForm } from "@/components/features/client-form";
import { verifySession } from "@/lib/auth";

export const instant = false;

export default async function NewClientPage() {
  await verifySession();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">Novo cliente</h1>
      <ClientForm />
    </div>
  );
}
