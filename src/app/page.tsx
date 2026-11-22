import type { Metadata } from "next";

import { Audience } from "@/components/landing/audience";
import { CallToAction } from "@/components/landing/call-to-action";
import { DocumentSection } from "@/components/landing/document-section";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";

export const metadata: Metadata = {
  title: "Drafto — Propostas comerciais prontas para enviar",
  description:
    "Monte propostas comerciais profissionais para eventos em minutos: assistente em 4 etapas, pré-visualização em tempo real, PDF A4 paginado automaticamente, composição de valores e link público para o cliente.",
  keywords: [
    "proposta comercial",
    "proposta de evento",
    "credenciamento",
    "gerador de propostas",
    "PDF de proposta",
  ],
  openGraph: {
    title: "Drafto — Propostas comerciais prontas para enviar",
    description:
      "Assistente em 4 etapas, pré-visualização em tempo real, PDF A4 paginado e link público para o cliente.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <DocumentSection />
        <Audience />
        <Faq />
        <CallToAction />
      </main>
      <LandingFooter />
    </div>
  );
}
