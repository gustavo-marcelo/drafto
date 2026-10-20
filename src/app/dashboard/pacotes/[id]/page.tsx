import { notFound } from "next/navigation";

import { PackageForm } from "@/components/features/package-form";
import { verifySession } from "@/lib/auth";
import { parsePackagePayload } from "@/lib/package-payload";
import { getPackageById } from "@/services/packages";
import { listResources } from "@/services/resources";

type Params = Promise<{ id: string }>;

export const instant = false;

export default async function PackageDetailPage({ params }: { params: Params }) {
  await verifySession();

  const { id } = await params;
  const [pkg, resources] = await Promise.all([getPackageById(id), listResources()]);

  if (!pkg) {
    notFound();
  }

  const payload = parsePackagePayload(pkg.payload);
  const resourcesByKey = new Map(resources.map((resource) => [resource.key, resource.key]));
  const resourcesByTitle = new Map(resources.map((resource) => [resource.title, resource.key]));

  const selectedKeys = (payload.recursos ?? [])
    .map((entry) => resourcesByKey.get(entry) ?? resourcesByTitle.get(entry) ?? entry)
    .filter((entry) => resourcesByKey.has(entry));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">{pkg.name}</h1>
      <PackageForm
        resources={resources}
        packageId={pkg.id}
        initialData={{
          name: pkg.name,
          description: pkg.description ?? "",
          audience: pkg.audience ?? "",
          recursos: selectedKeys,
          equipamentos: (payload.equipamentos ?? []).map((item) => ({
            name: item.name,
            description: item.description ?? "",
            quantity: item.quantity ?? 1,
            specs: item.specs ?? "",
          })),
        }}
      />
    </div>
  );
}
