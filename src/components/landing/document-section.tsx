const SECTIONS = [
  {
    title: "Apresentação e cliente",
    description: "Capa do evento, dados da operação e identificação da empresa contratante.",
  },
  {
    title: "Recursos do sistema",
    description: "Módulos de credenciamento organizados em duas colunas, com descrições.",
  },
  {
    title: "Infraestrutura e operação",
    description: "Equipamentos, equipes e serviços que sustentam a operação no dia do evento.",
  },
  {
    title: "Requisitos e cronograma",
    description:
      "Pré-requisitos, marcos operacionais e avisos contratuais na sequência do documento.",
  },
  {
    title: "Condições comerciais",
    description: "Validade, forma de pagamento e composição do valor item a item.",
  },
  {
    title: "Aceite e assinaturas",
    description: "Campo de aceite e assinaturas da contratada e do contratante.",
  },
];

export function DocumentSection() {
  return (
    <section id="documento" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-accent-900 text-sm font-semibold tracking-wide uppercase">
            O documento
          </p>
          <h2 className="text-primary-900 mt-2 text-3xl font-semibold tracking-tight text-balance">
            Uma proposta com cara de material comercial
          </h2>
          <p className="text-primary-700 mt-4 leading-relaxed">
            O documento segue uma estrutura pensada para venda: contexto e cliente no topo, solução
            e operação no meio, condições comerciais e aceite no final. Quando o conteúdo cresce, as
            páginas se reorganizam sozinhas — a página de valores sempre começa uma nova página.
          </p>
          <p className="text-primary-700 mt-4 leading-relaxed">
            O rodapé traz numeração de páginas, sua marca e o contato da empresa. Tudo é gerado em
            A4, pronto para PDF ou para o link público.
          </p>
        </div>

        <ol className="border-primary-100 divide-primary-100 divide-y overflow-hidden rounded-lg border">
          {SECTIONS.map((section, index) => (
            <li key={section.title} className="flex gap-4 bg-white p-5">
              <span className="text-primary-600 font-mono text-sm font-semibold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-primary-900 text-sm font-semibold">{section.title}</h3>
                <p className="text-primary-700 mt-1 text-sm leading-relaxed">
                  {section.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
