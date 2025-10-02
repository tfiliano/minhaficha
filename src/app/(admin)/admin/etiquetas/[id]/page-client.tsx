"use client";

import { Forms } from "@/components/forms";
import { EtiquetaProps } from "@/components/forms/Etiquetas";
import { ArrowLeft, Calendar, Hash, Layers, Package, Tag } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function EtiquetasUpdateClient({ etiqueta, ...props }: EtiquetaProps) {
  const titulo = etiqueta?.produto_nome || etiqueta?.codigo_produto || "Etiqueta";
  const validade = etiqueta?.validade ? new Date(etiqueta.validade) : null;
  const hoje = new Date();
  const diasRestantes = validade ? Math.floor((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isVencido = diasRestantes !== null && diasRestantes < 0;
  const isProximoVencer = diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 7;

  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <Link href="/admin/etiquetas">
              <Button variant="ghost" size="sm" className="gap-2 shrink-0">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            </Link>
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shrink-0">
                <Tag className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white truncate">
                  Editar Etiqueta
                </h1>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="truncate">{titulo}</span>
                  {etiqueta?.status && (
                    <Badge
                      className={
                        etiqueta.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        etiqueta.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }
                    >
                      {etiqueta.status === 'completed' ? 'Completo' :
                       etiqueta.status === 'error' ? 'Erro' :
                       etiqueta.status === 'pending' ? 'Pendente' : etiqueta.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações rápidas */}
      {etiqueta && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {etiqueta.lote && (
            <Card className="border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Lote</p>
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                  {etiqueta.lote}
                </div>
              </CardContent>
            </Card>
          )}
          {etiqueta.SIF && (
            <Card className="border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">S.I.F</p>
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                  {etiqueta.SIF}
                </div>
              </CardContent>
            </Card>
          )}
          {etiqueta.quantidade && (
            <Card className="border-2 hover:border-green-300 dark:hover:border-green-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Quantidade</p>
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {etiqueta.quantidade}
                </div>
              </CardContent>
            </Card>
          )}
          {etiqueta.validade && (
            <Card className={`border-2 transition-colors ${
              isVencido ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20' :
              isProximoVencer ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/20' :
              'hover:border-blue-300 dark:hover:border-blue-700'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`h-4 w-4 ${
                    isVencido ? 'text-red-600 dark:text-red-400' :
                    isProximoVencer ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Validade</p>
                </div>
                <div className={`text-base sm:text-lg font-bold ${
                  isVencido ? 'text-red-700 dark:text-red-300' :
                  isProximoVencer ? 'text-yellow-700 dark:text-yellow-300' :
                  'text-slate-900 dark:text-white'
                }`}>
                  {validade.toLocaleDateString('pt-BR')}
                </div>
                {diasRestantes !== null && (
                  <p className={`text-xs mt-1 ${
                    isVencido ? 'text-red-600 dark:text-red-400' :
                    isProximoVencer ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-slate-500 dark:text-slate-400'
                  }`}>
                    {isVencido ? `Vencido há ${Math.abs(diasRestantes)} dias` :
                     diasRestantes === 0 ? 'Vence hoje' :
                     diasRestantes === 1 ? 'Vence amanhã' :
                     `${diasRestantes} dias restantes`}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Formulário */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b">
          <CardTitle className="text-lg sm:text-xl">Dados da Etiqueta</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
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
