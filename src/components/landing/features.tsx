import {
  IconCalendar,
  IconChart,
  IconClock,
  IconDocument,
  IconEye,
  IconLink,
  IconServer,
  IconStack,
} from "./icons";

const FEATURES = [
  {
    icon: IconClock,
    title: "Assistente em 4 etapas",
    description:
      "Evento e cliente, módulos e infraestrutura, valores e pagamento, operacional e revisão. Nada de formulário gigante.",
  },
  {
    icon: IconEye,
    title: "Pré-visualização em tempo real",
    description:
      "O documento é desenhado enquanto você preenche, com a paginação real — você vê exatamente o que o cliente vai receber.",
  },
  {
    icon: IconDocument,
    title: "PDF A4 profissional",
    description:
      "Logo, cabeçalho, rodapé, tabela de valores e assinaturas no mesmo formato do documento enviado.",
  },
  {
    icon: IconLink,
    title: "Link público de compartilhamento",
    description:
      "Envie o link da proposta para o cliente acompanhar, sem criar conta e sem instalar nada.",
  },
  {
    icon: IconStack,
    title: "Catálogo reutilizável",
    description:
      "Clientes, pacotes, recursos e infraestrutura cadastrados uma vez e reaproveitados em novas propostas.",
  },
  {
    icon: IconChart,
    title: "Composição de valor por itens",
    description:
      "Descreva, quantidade, valor unitário e subtotal de cada item — o total é calculado automaticamente.",
  },
  {
    icon: IconCalendar,
    title: "Cronograma operacional no documento",
    description:
      "Marcos, responsáveis e avisos contratuais entram na proposta, com paginação automática quando o conteúdo cresce.",
  },
  {
    icon: IconServer,
    title: "Roda no seu servidor",
    description:
      "Deploy simples no seu próprio ambiente (inclusive em Raspberry Pi), com banco de dados e identidade da sua empresa.",
  },
];

export function Features() {
  return (
    <section id="recursos" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-accent-900 text-sm font-semibold tracking-wide uppercase">Recursos</p>
          <h2 className="text-primary-900 mt-2 text-3xl font-semibold tracking-tight text-balance">
            Tudo o que a proposta precisa, sem trabalho repetitivo
          </h2>
          <p className="text-primary-700 mt-4 leading-relaxed">
            Do primeiro rascunho ao PDF final assinado, o sistema cuida do documento e você cuida da
            negociação.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="border-primary-100 hover:border-primary-200 rounded-lg border bg-white p-6 transition-colors"
            >
              <span className="bg-primary-50 text-primary-700 flex h-11 w-11 items-center justify-center rounded-lg">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="text-primary-900 mt-4 font-semibold">{feature.title}</h3>
              <p className="text-primary-700 mt-2 text-sm leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
