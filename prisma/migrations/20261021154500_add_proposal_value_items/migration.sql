-- CreateTable: composição do valor por proposta
CREATE TABLE "ProposalValueItem" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitValue" DECIMAL(12,2) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "proposalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalValueItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProposalValueItem_proposalId_idx" ON "ProposalValueItem"("proposalId");

-- AddForeignKey
ALTER TABLE "ProposalValueItem" ADD CONSTRAINT "ProposalValueItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
