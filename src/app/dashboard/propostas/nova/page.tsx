import { ProposalWizard } from "@/components/features/wizard/proposal-wizard";
import { verifySession } from "@/lib/auth";
import { listInfrastructures } from "@/services/infrastructures";
import { listClients, listPackages } from "@/services/proposals";
import { listProjectOptions } from "@/services/projects";
import { listResources } from "@/services/resources";
import { getSettings } from "@/services/settings";

export const instant = false;

export default async function NewProposalPage() {
  await verifySession();

  const [clients, projects, packages, resources, infrastructures, settings] = await Promise.all([
    listClients(),
    listProjectOptions(),
    listPackages(),
    listResources(),
    listInfrastructures(),
    getSettings(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">Nova proposta</h1>
      <ProposalWizard
        clients={clients}
        projects={projects}
        packages={packages}
        resources={resources}
        infrastructures={infrastructures}
        settings={settings}
      />
    </div>
  );
}
