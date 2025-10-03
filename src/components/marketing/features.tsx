"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UtensilsCrossed,
  Printer,
  Truck,
  ChefHat,
  BarChart3,
  Store,
} from "lucide-react";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Controle de Produção",
    description: "Registre toda a produção diária com rastreabilidade completa. Acompanhe lotes, quantidades e responsáveis.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Printer,
    title: "Etiquetas Inteligentes",
    description: "Imprima etiquetas automaticamente com código de barras, validade, lote e todas as informações necessárias para compliance.",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: Truck,
    title: "Recebimento de Mercadorias",
    description: "Controle entrada de insumos, validades e rastreie fornecedores. Mantenha seu estoque sempre organizado.",
    gradient: "from-teal-500 to-green-500",
  },
  {
    icon: ChefHat,
    title: "Ficha Técnica com Custo",
    description: "Crie fichas técnicas detalhadas com cálculo automático de custo, rendimento e margem de contribuição.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Relatórios Gerenciais",
    description: "Análises de produção, custos, margem e rastreabilidade. Exporte para Excel com um clique.",
    gradient: "from-emerald-500 to-blue-500",
  },
  {
    icon: Store,
    title: "Multi-loja",
    description: "Gerencie múltiplas unidades em uma única plataforma. Controle de permissões por loja e usuário.",
    gradient: "from-purple-500 to-blue-500",
  },
];

export function Features() {
  return (
    <section id="features" className="container mx-auto px-4 py-20 md:py-32">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Tudo que você precisa em{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            um só lugar
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Funcionalidades completas para gestão profissional de cozinhas e restaurantes
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} mb-4 w-fit`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
