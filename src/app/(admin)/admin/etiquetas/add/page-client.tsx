"use client";

import { Forms } from "@/components/forms";
import { EtiquetaProps } from "@/components/forms/Etiquetas";
import { ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EtiquetasAddClient({ fabricantes }: EtiquetaProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/etiquetas">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <Tag className="h-6 w-6" />
              </div>
              Nova Etiqueta
            </h1>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Preencha as informações para criar uma nova etiqueta de rastreamento
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b">
          <CardTitle>Dados da Etiqueta</CardTitle>
          <CardDescription>
            Todos os campos marcados com * são obrigatórios
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Forms.Etiquetas.Create fabricantes={fabricantes} />
        </CardContent>
      </Card>
    </div>
  );
}
