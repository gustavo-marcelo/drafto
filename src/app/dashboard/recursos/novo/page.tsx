import { ResourceForm } from "@/components/features/resource-form";
import { verifySession } from "@/lib/auth";

export const instant = false;

export default async function NewResourcePage() {
  await verifySession();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">Novo recurso</h1>
      <ResourceForm />
    </div>
  );
}
