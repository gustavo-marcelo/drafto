const FAQ = [
  {
    question: "Preciso criar cadastro para o cliente?",
    answer:
      "Não. O sistema gera um link público da proposta: o cliente abre no navegador e acompanha o documento sem conta e sem download.",
  },
  {
    question: "A proposta sai com a minha marca?",
    answer:
      "Sim. Logo, tagline, dados de contato e assinaturas são configurados uma vez nas configurações e aplicados a todos os documentos.",
  },
  {
    question: "O que acontece quando a proposta fica muito grande?",
    answer:
      "O documento se repagina sozinho: recursos, infraestrutura e cronograma são reorganizados entre as páginas sem cortar nenhum item.",
  },
  {
    question: "Posso usar com mais de uma pessoa na equipe?",
    answer:
      "Sim. Existem contas de acesso com dados isolados por usuário, para o comercial e para a operação usarem o mesmo ambiente.",
  },
  {
    question: "Os dados das propostas ficam na nuvem?",
    answer:
      "Não. O Proposta.ai roda onde você quiser — inclusive no seu próprio servidor ou em um Raspberry Pi na rede local — com o seu banco de dados.",
  },
];

export function Faq() {
  return (
    <section id="duvidas" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-accent-900 text-sm font-semibold tracking-wide uppercase">Dúvidas</p>
            <h2 className="text-primary-900 mt-2 text-3xl font-semibold tracking-tight text-balance">
              Perguntas frequentes
            </h2>
            <p className="text-primary-700 mt-4 leading-relaxed">
              Ainda com dúvida? Fale com a gente:{" "}
              <a
                href="mailto:gustavo@espalha.ai"
                className="text-primary-800 underline underline-offset-4"
              >
                gustavo@espalha.ai
              </a>
            </p>
          </div>

          <div className="divide-primary-100 divide-y border-y">
            {FAQ.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="text-primary-900 flex cursor-pointer items-center justify-between gap-4 font-medium">
                  {item.question}
                  <span className="text-primary-600 text-xl leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-primary-700 mt-3 text-sm leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
