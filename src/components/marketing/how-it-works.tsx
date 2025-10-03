"use client";

import { Badge } from "@/components/ui/badge";
import { UserPlus, Settings, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Crie sua conta",
    description: "Cadastre-se gratuitamente e configure sua primeira loja em minutos.",
  },
  {
    icon: Settings,
    number: "02",
    title: "Configure seu sistema",
    description: "Adicione produtos, grupos, setores e operadores. É simples e intuitivo.",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Comece a usar",
    description: "Registre produção, imprima etiquetas e acompanhe tudo em tempo real.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-y">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-4 py-2 text-sm border-blue-200 dark:border-blue-800">
            Como funciona
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Simples e{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              rápido de usar
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece a gerenciar sua cozinha profissional em 3 passos simples
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center group">
                {/* Linha conectora (apenas para telas md+) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800" />
                )}

                {/* Número */}
                <div className="text-6xl font-bold text-blue-100 dark:text-blue-900/30 mb-4">
                  {step.number}
                </div>

                {/* Ícone */}
                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Conteúdo */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
