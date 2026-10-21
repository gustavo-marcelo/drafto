-- AlterTable: endereço estruturado no Client
ALTER TABLE "Client"
  ADD COLUMN "zipCode" TEXT,
  ADD COLUMN "street" TEXT,
  ADD COLUMN "number" TEXT,
  ADD COLUMN "complement" TEXT,
  ADD COLUMN "city" TEXT,
  ADD COLUMN "state" TEXT;

-- Migra o campo `address` legado (texto livre) para os novos campos.
-- Heurística para o formato "Logradouro, ..., Cidade - UF":
--   * state  = UF (2 letras após o último "-")
--   * city   = trecho entre a última vírgula e o "-"
--   * street = todo o restante antes da cidade
UPDATE "Client"
SET
  "state" = UPPER((regexp_match("address", '-\s*([A-Za-z]{2})\s*$'))[1]),
  "city" = NULLIF(TRIM((regexp_match("address", ',\s*([^,]+?)\s*-\s*[A-Za-z]{2}\s*$'))[1]), ''),
  "street" = NULLIF(
    TRIM(regexp_replace("address", ',\s*[^,]+?\s*-\s*[A-Za-z]{2}\s*$', '')),
    ''
  )
WHERE "address" ~ ',\s*[^,]+?\s*-\s*[A-Za-z]{2}\s*$';

-- Fallback: endereços que não seguem o padrão ficam inteiros em `street`.
UPDATE "Client"
SET "street" = NULLIF(TRIM("address"), '')
WHERE "address" IS NOT NULL
  AND "street" IS NULL;

-- Remove o campo legado.
ALTER TABLE "Client" DROP COLUMN "address";

-- AlterTable: telefone no User
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
