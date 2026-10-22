import { ProjectForm } from "@/components/features/project-form";
import { verifySession } from "@/lib/auth";
import { listClientOptions } from "@/services/clients";

export const instant = false;

export default async function NewProjectPage() {
  await verifySession();
  const clients = await listClientOptions();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">Novo projeto</h1>
      <ProjectForm clients={clients} />
    </div>
  );
}
