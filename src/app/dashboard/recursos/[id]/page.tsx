import { notFound } from "next/navigation";

import { ResourceForm } from "@/components/features/resource-form";
import { verifySession } from "@/lib/auth";
import { getResourceById } from "@/services/resources";

type Params = Promise<{ id: string }>;

export const instant = false;

export default async function ResourceDetailPage({ params }: { params: Params }) {
  await verifySession();

  const { id } = await params;
  const resource = await getResourceById(id);

  if (!resource) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">{resource.title}</h1>
      <ResourceForm
        resourceId={resource.id}
        resourceKey={resource.key}
        initialData={{
          title: resource.title,
          description: resource.description ?? "",
          position: resource.position,
          active: resource.active,
        }}
      />
    </div>
  );
}
