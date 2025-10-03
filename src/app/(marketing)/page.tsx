import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CTA } from "@/components/marketing/cta";

export const metadata = {
  title: "Minha Ficha - Gestão Completa para Cozinha Profissional",
  description: "Controle produção, custos, etiquetas e relatórios em um só lugar. Sistema completo para gestão de restaurantes e cozinhas profissionais.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </>
  );
}
