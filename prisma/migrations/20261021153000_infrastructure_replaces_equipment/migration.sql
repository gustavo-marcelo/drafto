-- CreateTable: catálogo de infraestrutura e operação
CREATE TABLE "Infrastructure" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Infrastructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable: snapshot de infraestrutura por proposta
CREATE TABLE "ProposalInfrastructure" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "proposalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalInfrastructure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Infrastructure_key_key" ON "Infrastructure"("key");

-- CreateIndex
CREATE INDEX "Infrastructure_position_idx" ON "Infrastructure"("position");

-- CreateIndex
CREATE INDEX "ProposalInfrastructure_proposalId_idx" ON "ProposalInfrastructure"("proposalId");

-- AddForeignKey
ALTER TABLE "ProposalInfrastructure" ADD CONSTRAINT "ProposalInfrastructure_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Converte os equipamentos existentes em itens de infraestrutura e operação.
-- Base normalizada: uma linha por equipamento, com a chave gerada a partir do nome.
CREATE TEMPORARY TABLE "_mig_equipment_base" AS
SELECT
  ROW_NUMBER() OVER () AS seq,
  e."proposalId",
  btrim(e."name") AS name,
  CASE
    WHEN e."quantity" > 1
      THEN concat(
        btrim(COALESCE(e."description", '')),
        CASE WHEN btrim(COALESCE(e."description", '')) <> '' THEN ' ' ELSE '' END,
        e."quantity",
        ' un.'
      )
    ELSE btrim(COALESCE(e."description", ''))
  END AS description,
  NULLIF(
    trim(both '-' FROM regexp_replace(
      translate(lower(btrim(e."name")), 'áàâãäçéèêëíìîïóòôõöúùûüñ', 'aaaaaceeeeiiiiooooouuuun'),
      '[^a-z0-9]+', '-', 'g'
    )),
    '-'
  ) AS slug
FROM "Equipment" e
WHERE btrim(COALESCE(e."name", '')) <> '';

-- Catálogo: um item por nome distinto, na ordem alfabética das chaves.
CREATE TEMPORARY TABLE "_mig_infrastructure_catalog" AS
SELECT
  md5(b.slug) AS id,
  b.slug AS key,
  b.name AS title,
  NULLIF(b.description, '') AS description,
  ROW_NUMBER() OVER (ORDER BY b.slug) - 1 AS position
FROM (
  SELECT DISTINCT ON (slug) slug, name, description
  FROM "_mig_equipment_base"
  ORDER BY slug, name
) b;

INSERT INTO "Infrastructure" (id, key, title, description, position, active, "createdAt", "updatedAt")
SELECT
  c.id,
  c.key,
  c.title,
  c.description,
  c.position,
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_mig_infrastructure_catalog" c;

-- Snapshot por proposta: mantém o vínculo com a proposta original.
INSERT INTO "ProposalInfrastructure" (id, key, title, description, "proposalId", "createdAt", "updatedAt")
SELECT
  md5(b."proposalId" || '|' || b.slug || '|' || b.seq),
  b.slug,
  b.name,
  NULLIF(b.description, ''),
  b."proposalId",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_mig_equipment_base" b;

DROP TABLE "_mig_infrastructure_catalog";
DROP TABLE "_mig_equipment_base";

-- Remove o modelo de equipamentos.
DROP TABLE "Equipment";
