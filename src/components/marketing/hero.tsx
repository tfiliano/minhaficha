"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="px-4 py-2 text-sm border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="h-3 w-3 mr-2 text-blue-600 dark:text-blue-400" />
            Sistema completo para gestão de cozinha profissional
          </Badge>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Gestão Completa
          </span>
          <br />
          para sua Cozinha Profissional
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Controle produção, custos, etiquetas e relatórios em um só lugar.
          Simplifique a gestão do seu restaurante com tecnologia.
        </p>

        {/* Features list */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Controle de Produção</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Etiquetas Automáticas</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Fichas Técnicas</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Relatórios Gerenciais</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/auth/login">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8">
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver Funcionalidades
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <p className="text-sm text-muted-foreground pt-8">
          Usado por restaurantes e cozinhas profissionais em todo o Brasil
        </p>
      </div>
    </section>
  );
}
