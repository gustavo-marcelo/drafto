import Image from "next/image";
import Link from "next/link";

import { IconArrowRight, IconCheck } from "./icons";

const HIGHLIGHTS = [
  "Wizard em 4 etapas",
  "Pré-visualização em tempo real",
  "PDF A4 paginado automaticamente",
  "Link público sem cadastro e sem download",
];

function DocumentPreview() {
  return (
    <div className="border-primary-100 relative rounded-xl border bg-white p-5 shadow-[0_24px_60px_-30px_rgba(0,36,40,0.45)]">
      <div className="border-primary-100 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={24} height={24} className="h-6 w-6" />
          <span className="text-primary-900 text-xs font-semibold">Sua Empresa</span>
        </div>
        <span className="text-primary-600 text-[10px]">Proposta PR0001.0001</span>
      </div>

      <div className="pt-4">
        <p className="text-primary-900 text-sm font-semibold">Credenciamento do Evento Arena</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["12/11/2026", "São Paulo", "5.000"].map((value) => (
            <div key={value} className="bg-primary-50/70 rounded px-2 py-1.5">
              <p className="text-primary-600 text-[9px] tracking-wide uppercase">
                {
                  ["Data", "Local", "Público estimado"][
                    ["12/11/2026", "São Paulo", "5.000"].indexOf(value)
                  ]
                }
              </p>
              <p className="text-primary-800 text-[11px] font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-primary-100 mt-4 border-t pt-3">
        <p className="text-primary-500 text-[9px] font-bold tracking-[0.12em] uppercase">
          Recursos do sistema de credenciamento
        </p>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
          {[
            "Emissão de credenciais",
            "Controle de acesso",
            "Auditoria completa",
            "Totens de autoatendimento",
          ].map((item) => (
            <div key={item} className="flex items-start gap-1.5">
              <IconCheck className="text-accent-800 mt-0.5 h-3 w-3 shrink-0" />
              <span className="text-primary-800 text-[11px] leading-tight">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-primary-100 mt-4 border-t pt-3">
        <p className="text-primary-500 text-[9px] font-bold tracking-[0.12em] uppercase">
          Condições comerciais
        </p>
        <div className="mt-2 space-y-1">
          {["Pacote de credenciamento", "Operação assistida", "Suporte em evento"].map(
            (row, index) => (
              <div key={row} className="flex items-center justify-between">
                <span className="text-primary-800 text-[11px]">{row}</span>
                <span className="text-primary-900 text-[11px] font-semibold blur-xs select-none">
                  {["12.500,00", "4.800,00", "2.700,00"][index]}
                </span>
              </div>
            ),
          )}
          <div className="bg-accent-50 mt-2 flex items-center justify-between rounded px-2 py-1">
            <span className="text-accent-900 text-[11px] font-semibold">Investimento</span>
            <span className="text-accent-900 text-[11px] font-bold blur-xs select-none">
              20.000,00
            </span>
          </div>
        </div>
      </div>

      <div className="text-primary-600 border-primary-100 mt-4 flex items-center justify-between border-t pt-2 text-[10px]">
        <span>Documento gerado eletronicamente</span>
        <span className="text-primary-700 font-semibold">Página 1 de 3</span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="bg-primary-50/60 border-primary-100 border-b">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div>
          <span className="border-primary-200 text-primary-700 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium">
            <span className="bg-accent-500 h-1.5 w-1.5 rounded-full" />
            Documento A4 que se pagina sozinho, sem cortar nada
          </span>

          <h1 className="text-primary-900 mt-6 text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
            Propostas comerciais prontas para enviar, em minutos.
          </h1>

          <p className="text-primary-700 mt-5 text-lg leading-relaxed text-pretty">
            O Drafto monta o documento da proposta do seu evento — recursos, infraestrutura,
            cronograma, valores e aceite — com a identidade da sua empresa. Você preenche um
            assistente passo a passo e o sistema cuida do PDF profissional.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="bg-primary-700 hover:bg-primary-800 inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 font-medium text-white transition-colors"
            >
              Entrar no sistema
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#como-funciona"
              className="border-primary-200 hover:bg-primary-50 text-primary-800 inline-flex items-center justify-center rounded-md border bg-white px-6 py-3 font-medium transition-colors"
            >
              Ver como funciona
            </a>
          </div>

          <ul className="mt-8 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="text-primary-700 flex items-center gap-2 text-sm">
                <IconCheck className="text-accent-800 h-4 w-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="border-primary-200/70 bg-primary-100/40 absolute -inset-4 -z-10 rounded-2xl blur-2xl" />
          <DocumentPreview />
        </div>
      </div>
    </section>
  );
}
