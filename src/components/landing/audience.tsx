import { IconShield, IconStack, IconWand } from "./icons";

const AUDIENCES = [
  {
    icon: IconWand,
    title: "Empresas de credenciamento",
    description:
      "Padronize a proposta que você manda para cada operador,arena ou parque e pare de remontar o documento toda vez.",
  },
  {
    icon: IconStack,
    title: "Organizadoras de eventos",
    description:
      "Monte propostas com escopo fechado — equipamento, equipe, cronograma e valores — compartilhando com o cliente por link.",
  },
  {
    icon: IconShield,
    title: "Operadoras de ticketing white-label",
    description:
      "Entregue a proposta com a sua marca: logo, cores, contato e assinaturas vêm das configurações do sistema.",
  },
];

export function Audience() {
  return (
    <section className="bg-primary-50/60 border-primary-100 border-y py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-accent-900 text-sm font-semibold tracking-wide uppercase">
            Para quem é
          </p>
          <h2 className="text-primary-900 mt-2 text-3xl font-semibold tracking-tight text-balance">
            Feito para quem vende operação de evento
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <article
              key={audience.title}
              className="border-primary-100 rounded-lg border bg-white p-6"
            >
              <span className="bg-accent-50 text-accent-900 flex h-11 w-11 items-center justify-center rounded-lg">
                <audience.icon className="h-5 w-5" />
              </span>
              <h3 className="text-primary-900 mt-4 font-semibold">{audience.title}</h3>
              <p className="text-primary-700 mt-2 text-sm leading-relaxed">
                {audience.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
