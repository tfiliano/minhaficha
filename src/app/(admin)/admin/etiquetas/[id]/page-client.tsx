"use client";

import { Forms } from "@/components/forms";
import { EtiquetaProps } from "@/components/forms/Etiquetas";
import { ArrowLeft, Edit, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function EtiquetasUpdateClient({ etiqueta, ...props }: EtiquetaProps) {
  const titulo = etiqueta?.produto_nome || etiqueta?.codigo_produto || "Etiqueta";
  
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
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                <Edit className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Editar Etiqueta
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                  {titulo}
                  {etiqueta?.status && (
                    <Badge 
                      variant={
                        etiqueta.status === 'completed' ? 'default' :
                        etiqueta.status === 'error' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {etiqueta.status}
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações rápidas */}
      {etiqueta && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {etiqueta.lote && (
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {etiqueta.lote}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">Lote</p>
              </CardContent>
            </Card>
          )}
          {etiqueta.SIF && (
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {etiqueta.SIF}
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400">S.I.F</p>
              </CardContent>
            </Card>
          )}
          {etiqueta.quantidade && (
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {etiqueta.quantidade}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">Quantidade</p>
              </CardContent>
            </Card>
          )}
          {etiqueta.validade && (
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
                  {new Date(etiqueta.validade).toLocaleDateString('pt-BR')}
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">Validade</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Formulário */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 border-b">
          <CardTitle>Dados da Etiqueta</CardTitle>
          <CardDescription>
            Atualize as informações necessárias
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Forms.Etiquetas.Update etiqueta={etiqueta} {...props} />
        </CardContent>
      </Card>
    </div>
  );
}
