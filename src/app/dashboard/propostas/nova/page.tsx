import { ProposalWizard } from "@/components/features/wizard/proposal-wizard";
import { verifySession } from "@/lib/auth";
import { listClients, listPackages } from "@/services/proposals";
import { listResources } from "@/services/resources";
import { getSettings } from "@/services/settings";

export const instant = false;

export default async function NewProposalPage() {
  await verifySession();

  const [clients, packages, resources, settings] = await Promise.all([
    listClients(),
    listPackages(),
    listResources(),
    getSettings(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-900 text-2xl font-semibold">Nova proposta</h1>
      <ProposalWizard
        clients={clients}
        packages={packages}
        resources={resources}
        settings={settings}
      />
    </div>
  );
}
