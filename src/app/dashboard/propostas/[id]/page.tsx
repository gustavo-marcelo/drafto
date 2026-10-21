import { notFound } from "next/navigation";

import { ProposalShareActions } from "@/components/features/proposal-share-actions";
import { ProposalStatusControl } from "@/components/features/proposal-status-control";
import { ProposalWizard } from "@/components/features/wizard/proposal-wizard";
import { verifySession } from "@/lib/auth";
import { toDateInputValue } from "@/lib/format";
import { getProposalById, listClients, listPackages } from "@/services/proposals";
import { expireOverdueProposals } from "@/services/expiration";
import { listInfrastructures } from "@/services/infrastructures";
import { listResources } from "@/services/resources";
import { getSettings } from "@/services/settings";

type Params = Promise<{ id: string }>;

export const instant = false;

export default async function ProposalDetailPage({ params }: { params: Params }) {
  await verifySession();
  await expireOverdueProposals();

  const { id } = await params;
  const [proposal, clients, packages, resources, infrastructures, settings] = await Promise.all([
    getProposalById(id),
    listClients(),
    listPackages(),
    listResources(),
    listInfrastructures(),
    getSettings(),
  ]);

  if (!proposal) {
    notFound();
  }

  const payload = (proposal.payload ?? {}) as {
    paymentMethod?: string | null;
    includedCosts?: string | null;
    requirements?: string | null;
    disclaimer?: string | null;
    acceptanceNote?: string | null;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {proposal.code && <code className="text-primary-700 text-sm">{proposal.code}</code>}
          <h1 className="text-primary-900 text-2xl font-semibold">{proposal.title}</h1>
          <ProposalStatusControl proposalId={proposal.id} status={proposal.status} />
        </div>
        <ProposalShareActions proposalId={proposal.id} shareId={proposal.shareId} />
      </div>

      <ProposalWizard
        clients={clients}
        packages={packages}
        resources={resources}
        infrastructures={infrastructures}
        proposalId={proposal.id}
        settings={settings}
        initialData={{
          title: proposal.title,
          subtitle: proposal.subtitle ?? "",
          eventDate: toDateInputValue(proposal.eventDate),
          issuedAt: toDateInputValue(proposal.issuedAt),
          location: proposal.location ?? "",
          audience: proposal.audience ?? "",
          clientId: proposal.clientId ?? "",
          solution: proposal.solution ?? "",
          modules: proposal.modules.map((module) => ({
            key: module.key,
            title: module.title,
            description: module.description ?? "",
          })),
          infrastructure: proposal.infrastructure.map((item) => ({
            key: item.key,
            title: item.title,
            description: item.description ?? "",
          })),
          packageId: proposal.packageId ?? "",
          totalAmount: proposal.totalAmount ? proposal.totalAmount.toNumber() : undefined,
          paymentMethod: payload.paymentMethod ?? "",
          validUntil: toDateInputValue(proposal.validUntil),
          includedCosts: payload.includedCosts ?? "",
          payments: proposal.payments.map((payment) => ({
            dueDate: toDateInputValue(payment.dueDate),
            amount: payment.amount.toNumber(),
          })),
          requirements: payload.requirements ?? "",
          disclaimer: payload.disclaimer ?? "",
          acceptanceNote: payload.acceptanceNote ?? "",
          schedule: proposal.schedule.map((item) => ({
            date: item.date,
            title: item.title,
            description: item.description ?? "",
          })),
        }}
      />
    </div>
  );
}
