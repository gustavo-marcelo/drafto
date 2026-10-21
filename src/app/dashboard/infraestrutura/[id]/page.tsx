import { notFound } from "next/navigation";

import { InfrastructureForm } from "@/components/features/infrastructure-form";
import { verifySession } from "@/lib/auth";
import { getInfrastructureById } from "@/services/infrastructures";

type Params = Promise<{ id: string }>;

export const instant = false;

export default async function InfrastructureDetailPage({ params }: { params: Params }) {
  await verifySession();

  const { id } = await params;
  const infrastructure = await getInfrastructureById(id);

  if (!infrastructure) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">{infrastructure.title}</h1>
      <InfrastructureForm
        infrastructureId={infrastructure.id}
        infrastructureKey={infrastructure.key}
        initialData={{
          title: infrastructure.title,
          description: infrastructure.description ?? "",
          position: infrastructure.position,
          active: infrastructure.active,
        }}
      />
    </div>
  );
}
