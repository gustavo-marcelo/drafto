import { PackageForm } from "@/components/features/package-form";
import { verifySession } from "@/lib/auth";
import { listInfrastructures } from "@/services/infrastructures";
import { listResources } from "@/services/resources";

export const instant = false;

export default async function NewPackagePage() {
  await verifySession();
  const [resources, infrastructures] = await Promise.all([listResources(), listInfrastructures()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">Novo pacote</h1>
      <PackageForm resources={resources} infrastructures={infrastructures} />
    </div>
  );
}
