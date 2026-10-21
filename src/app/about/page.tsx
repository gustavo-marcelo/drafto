import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre — Proposta.ai",
  description: "O que é o Proposta.ai e quem é o autor do projeto.",
};

const FEATURES = [
  "Wizard guiado por etapas: evento, cliente, recursos, infraestrutura, operacional e condições comerciais.",
  "Pré-visualização em tempo real do documento de proposta durante o preenchimento.",
  "Exportação em PDF de 3 páginas com a identidade da sua empresa: logo, cores, assinatura e rodapé.",
  "Link público para compartilhar a proposta com o cliente, sem necessidade de cadastro.",
  "Gestão de clientes, pacotes, recursos e infraestrutura reutilizáveis entre propostas.",
  "Cronograma operacional e cronograma de pagamento embutidos no documento.",
  "Configurações globais de identidade e contato usadas em todas as propostas.",
  "Contas de acesso para a equipe, com dados isolados por usuário.",
];

export default function AboutPage() {
  return (
    <main className="bg-primary-50 flex flex-1 flex-col items-center p-8">
      <div className="w-full max-w-2xl">
        <div className="border-primary-100 rounded-lg border bg-white p-8">
          <h1 className="text-primary-900 text-2xl font-semibold">Sobre o Proposta.ai</h1>
          <p className="text-primary-700 mt-3 leading-relaxed">
            Gerador de propostas comerciais para empresas de credenciamento e gestão de eventos.
            Cadastre clientes, pacotes e recursos uma vez e monte propostas completas em minutos,
            com pré-visualização em tempo real e exportação em PDF pronta para enviar ao cliente.
          </p>

          <h2 className="text-primary-900 mt-8 text-lg font-semibold">O que o sistema faz</h2>
          <ul className="mt-3 space-y-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="text-primary-700 flex gap-2 leading-relaxed">
                <span className="text-primary-600">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-primary-900 mt-8 text-lg font-semibold">O autor</h2>
          <p className="text-primary-900 mt-3 font-medium">Gustavo Marcelo</p>
          <p className="text-primary-700">Criador e desenvolvedor do Proposta.ai.</p>
          <a
            href="mailto:gustavo@espalha.ai"
            className="text-primary-600 hover:text-primary-800 mt-1 inline-block text-sm underline-offset-4 hover:underline"
          >
            gustavo@espalha.ai
          </a>

          <div className="border-primary-100 mt-8 flex gap-4 border-t pt-5 text-sm">
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-800 underline-offset-4 hover:underline"
            >
              ← Início
            </Link>
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-800 underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
