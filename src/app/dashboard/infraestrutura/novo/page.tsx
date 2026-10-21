import { InfrastructureForm } from "@/components/features/infrastructure-form";
import { verifySession } from "@/lib/auth";

export const instant = false;

export default async function NewInfrastructurePage() {
  await verifySession();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">Novo item de infraestrutura</h1>
      <InfrastructureForm />
    </div>
  );
}
