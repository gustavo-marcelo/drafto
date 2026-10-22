const STEPS = [
  {
    number: "01",
    title: "Evento e cliente",
    description:
      "Dados do evento, local, público estimado e todos os dados da empresa contratante, com máscaras de CNPJ e telefone.",
  },
  {
    number: "02",
    title: "Módulos e infraestrutura",
    description:
      "Escolha os recursos do sistema de credenciamento e a infraestrutura de operação — tudo vem do seu catálogo.",
  },
  {
    number: "03",
    title: "Valores e pagamento",
    description:
      "Defina forma de pagamento, validade da proposta e a composição do valor item a item, com total automático.",
  },
  {
    number: "04",
    title: "Operacional e revisão",
    description:
      "Cronograma, avisos contratuais, pré-visualização final e exportação do PDF ou do link público.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="bg-primary-50/60 border-primary-100 scroll-mt-20 border-y py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-accent-900 text-sm font-semibold tracking-wide uppercase">
            Como funciona
          </p>
          <h2 className="text-primary-900 mt-2 text-3xl font-semibold tracking-tight text-balance">
            Da primeira reunião ao PDF assinado em quatro passos
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.number} className="border-primary-100 rounded-lg border bg-white p-6">
              <span className="text-accent-900 font-mono text-sm font-semibold">{step.number}</span>
              <h3 className="text-primary-900 mt-3 font-semibold">{step.title}</h3>
              <p className="text-primary-700 mt-2 text-sm leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
