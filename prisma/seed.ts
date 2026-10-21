import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { DEFAULT_INFRASTRUCTURES, DEFAULT_RESOURCES } from "../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "demo@destrava.ai").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "proposta123";
  const adminName = process.env.ADMIN_NAME ?? "Usuário Demo";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
    },
  });

  const demo =
    adminEmail === "demo@destrava.ai"
      ? user
      : await prisma.user.upsert({
          where: { email: "demo@destrava.ai" },
          update: {},
          create: {
            email: "demo@destrava.ai",
            name: "Usuário Demo",
            passwordHash: await bcrypt.hash("proposta123", 10),
          },
        });

  for (const [index, resource] of DEFAULT_RESOURCES.entries()) {
    await prisma.resource.upsert({
      where: { key: resource.key },
      update: {
        title: resource.title,
        description: resource.description,
        position: index,
      },
      create: {
        key: resource.key,
        title: resource.title,
        description: resource.description,
        position: index,
      },
    });
  }

  for (const [index, infrastructure] of DEFAULT_INFRASTRUCTURES.entries()) {
    await prisma.infrastructure.upsert({
      where: { key: infrastructure.key },
      update: {
        title: infrastructure.title,
        description: infrastructure.description,
        position: index,
      },
      create: {
        key: infrastructure.key,
        title: infrastructure.title,
        description: infrastructure.description,
        position: index,
      },
    });
  }

  const client = await prisma.client.upsert({
    where: { id: "seed-client-1" },
    update: {},
    create: {
      id: "seed-client-1",
      name: "Empresa Exemplo LTDA",
      zipCode: "70000-000",
      street: "SHS Quadra 6, Bloco C",
      number: "S/N",
      complement: "Edifício Exemplo",
      city: "Brasília",
      state: "DF",
      document: "00.000.000/0001-00",
      contact: "Maria Souza",
      phone: "(61) 98765-4321",
      email: "contato@empresaexemplo.com.br",
      clientCode: "CL1909.0180",
    },
  });

  const packagePayload = {
    recursos: [
      "importacao-participantes",
      "etiquetas-personalizadas",
      "identificacao-prioritaria",
      "controle-de-acesso",
    ],
    infraestrutura: ["totens-de-autoatendimento", "estacoes-de-impressao"],
  };

  await prisma.package.upsert({
    where: { id: "seed-package-1" },
    update: {
      name: "Evento até 500 pessoas",
      description: "Pacote padrão de credenciamento para eventos de pequeno e médio porte.",
      audience: "500 pessoas",
      payload: packagePayload,
    },
    create: {
      id: "seed-package-1",
      name: "Evento até 500 pessoas",
      description: "Pacote padrão de credenciamento para eventos de pequeno e médio porte.",
      audience: "500 pessoas",
      payload: packagePayload,
    },
  });

  await prisma.proposalScheduleItem.deleteMany({ where: { proposalId: "seed-proposal-1" } });
  await prisma.proposalModule.deleteMany({ where: { proposalId: "seed-proposal-1" } });

  await prisma.proposal.upsert({
    where: { id: "seed-proposal-1" },
    update: { code: "PR0001.0001", shareId: "demo1234abcd5678" },
    create: {
      id: "seed-proposal-1",
      code: "PR0001.0001",
      shareId: "demo1234abcd5678",
      title: "Evento Lançamento",
      subtitle: "Credenciamento e gestão de eventos",
      eventDate: new Date("2026-11-20T13:00:00Z"),
      location: "Brasília - DF",
      audience: "500 pessoas",
      solution: "Sistema de credenciamento com autoatendimento por totens.",
      status: "DRAFT",
      validUntil: new Date("2026-12-20T00:00:00Z"),
      totalAmount: 25000,
      clientId: client.id,
      authorId: demo.id,
      packageId: "seed-package-1",
      payments: {
        create: [
          { dueDate: new Date("2026-11-01T00:00:00Z"), amount: 12500 },
          { dueDate: new Date("2026-12-01T00:00:00Z"), amount: 12500 },
        ],
      },
    },
  });

  await prisma.proposalInfrastructure.deleteMany({ where: { proposalId: "seed-proposal-1" } });

  for (const resource of DEFAULT_RESOURCES.filter((item) =>
    packagePayload.recursos.includes(item.key),
  )) {
    await prisma.proposalModule.create({
      data: {
        proposalId: "seed-proposal-1",
        key: resource.key,
        title: resource.title,
        description: resource.description,
      },
    });
  }

  await prisma.proposalInfrastructure.create({
    data: {
      proposalId: "seed-proposal-1",
      key: "totens-de-autoatendimento",
      title: "Totens de autoatendimento",
      description: "Unidades self-service para emissão de credenciais no evento.",
    },
  });

  await prisma.proposalInfrastructure.create({
    data: {
      proposalId: "seed-proposal-1",
      key: "estacoes-de-impressao",
      title: "Estações de impressão",
      description: "Impressoras para crachás, etiquetas e materiais do participante.",
    },
  });

  await prisma.proposalScheduleItem.createMany({
    data: [
      {
        proposalId: "seed-proposal-1",
        date: "17/11/2026",
        title: "Montagem e preparação",
        description: "Instalação, configuração e testes da infraestrutura e da operação.",
        position: 0,
      },
      {
        proposalId: "seed-proposal-1",
        date: "18/11/2026",
        title: "Operação do evento",
        description: "Credenciamento, autoatendimento, impressão e suporte técnico presencial.",
        position: 1,
      },
      {
        proposalId: "seed-proposal-1",
        date: "Após encerramento",
        title: "Desmontagem e consolidação",
        description: "Retirada da infraestrutura e disponibilização da base consolidada.",
        position: 2,
      },
    ],
  });

  console.log(`Seed concluído. Usuário inicial: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
