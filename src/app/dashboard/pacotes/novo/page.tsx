import { PackageForm } from "@/components/features/package-form";
import { verifySession } from "@/lib/auth";
import { listResources } from "@/services/resources";

export const instant = false;

export default async function NewPackagePage() {
  await verifySession();
  const resources = await listResources();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">Novo pacote</h1>
      <PackageForm resources={resources} />
    </div>
  );
}
