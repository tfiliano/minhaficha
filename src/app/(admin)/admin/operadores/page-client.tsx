"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/database.types";
import { 
  Search, 
  UserCheck, 
  Plus, 
  Hash,
  User,
  Clock,
  UserCircle,
  Palette
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { cn } from "@/lib/utils";

type Operador = Tables<`operadores`>;

type Operadores = {
  operadores: Operador[] | null;
};

export function OperadoresClient({
  operadores,
}: PropsWithChildren<Operadores>) {
  const pathname = usePathname();
  const [busca, setBusca] = useState("");

  const operadoresFiltrados = (operadores || []).filter((operador) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(operador.nome || "").includes(normalizar(busca)) ||
      normalizar(operador.matricula || "").includes(normalizar(busca))
    );
  });

  // Estatísticas
  const totalOperadores = operadoresFiltrados.length;
  const operadoresAtivos = operadoresFiltrados.filter(op => op.ativo).length;

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="bg-gradient-to-r from-slate-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Título e descrição */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Operadores
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Gerencie funcionários e operadores do sistema de produção
              </p>
            </div>
            {/* Estatísticas */}
            <div className="flex flex-wrap gap-3">
              <Badge className="px-3 py-1.5 bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
                <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                {totalOperadores} {totalOperadores === 1 ? 'operador' : 'operadores'}
              </Badge>
              <Badge className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                {operadoresAtivos} ativos
              </Badge>
            </div>
          </div>

          {/* Botão de adicionar */}
          <Link href={`${pathname}/add`}>
            <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Novo Operador
            </Button>
          </Link>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Buscar operadores por nome ou matrícula..."
          className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de operadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {operadoresFiltrados.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-6">
                  <UserCheck className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Nenhum operador encontrado
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
                  {busca ? 
                    `Nenhum operador corresponde à busca "${busca}"` : 
                    "Comece cadastrando operadores para o sistema de produção"
                  }
                </p>
                {!busca && (
                  <Link href={`${pathname}/add`}>
                    <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Operador
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          operadoresFiltrados.map((operador) => {
            const corFonte = operador.cor_fonte || '#1F2937';
            const isAtivo = operador.ativo;
            
            return (
              <Link href={pathname + `/${operador.id}`} key={operador.id}>
                <Card className={cn(
                  "group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2",
                  isAtivo 
                    ? "border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700" 
                    : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 opacity-75"
                )}>
                  {/* Gradiente decorativo */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    isAtivo 
                      ? "bg-gradient-to-br from-cyan-500/10 to-transparent" 
                      : "bg-gradient-to-br from-slate-500/10 to-transparent"
                  )} />
                  
                  <CardHeader className="relative pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className={cn(
                            "text-lg font-bold transition-colors line-clamp-2",
                            isAtivo 
                              ? "text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400" 
                              : "text-slate-500 dark:text-slate-400"
                          )}>
                            {operador.nome}
                          </CardTitle>
                          {!isAtivo && (
                            <Badge variant="outline" className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        {operador.id && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {operador.id.slice(0, 8)}
                          </p>
                        )}
                      </div>
                      <div className={cn(
                        "p-2 rounded-lg",
                        isAtivo 
                          ? "bg-cyan-100 dark:bg-cyan-900/30" 
                          : "bg-slate-200 dark:bg-slate-700"
                      )}>
                        <UserCircle className={cn(
                          "h-4 w-4",
                          isAtivo 
                            ? "text-cyan-600 dark:text-cyan-400" 
                            : "text-slate-400"
                        )} />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-4">
                    {/* Matrícula */}
                    {operador.matricula && (
                      <div className={cn(
                        "flex items-center gap-3 p-3 rounded-lg",
                        isAtivo 
                          ? "bg-slate-100 dark:bg-slate-800" 
                          : "bg-slate-200 dark:bg-slate-700"
                      )}>
                        <User className="h-4 w-4 text-slate-500" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Matrícula</p>
                          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 font-mono">
                            {operador.matricula}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Cor personalizada do operador */}
                    {operador.cor_fonte && (
                      <div className="flex items-center gap-3">
                        <Palette className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cor Personalizada</p>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center"
                              style={{ backgroundColor: corFonte }}
                            >
                              <User className="h-4 w-4" style={{ color: corFonte === '#1F2937' ? '#FFFFFF' : '#1F2937' }} />
                            </div>
                            <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                              {corFonte}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status e informações */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                            <p className={cn(
                              "text-sm font-medium",
                              isAtivo ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                            )}>
                              {isAtivo ? "Ativo" : "Inativo"}
                            </p>
                          </div>
                        </div>
                        
                        {/* Preview do operador */}
                        <div 
                          className="px-3 py-1 rounded-lg text-xs font-medium shadow-sm flex items-center gap-1"
                          style={{ 
                            backgroundColor: corFonte,
                            color: corFonte === '#1F2937' ? '#FFFFFF' : '#1F2937'
                          }}
                        >
                          <UserCircle className="h-3 w-3" />
                          {operador.nome?.split(' ')[0] || 'Operador'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Hover overlay com ações */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}