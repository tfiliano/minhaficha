"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { getWhatsAppLink } from "@/config/contact";

export function CTA() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-12 md:p-16 text-center text-white shadow-2xl">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">
              Pronto para transformar sua cozinha?
            </h2>
            <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto">
              Fale com nossos especialistas e descubra como o Minha Ficha pode otimizar sua gestão
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Sem taxa de instalação</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Suporte especializado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Atualizações gratuitas</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Link href={getWhatsAppLink("cta")} target="_blank">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-green-50 text-lg px-10 py-6 h-auto shadow-xl"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Falar no WhatsApp
                </Button>
              </Link>
              <p className="text-sm text-blue-100 mt-4">
                Atendimento rápido e personalizado
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
