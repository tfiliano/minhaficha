"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/database.types";
import { 
  Search, 
  Shield, 
  Plus, 
  Hash,
  FileText,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { cn } from "@/lib/utils";

type Sif = Tables<`sifs`>;

type SifsPage = {
  sifs: Sif[] | null;
};

export function SifsPageClient({ sifs }: PropsWithChildren<SifsPage>) {
  const pathname = usePathname();
  const [busca, setBusca] = useState("");

  const sifsFiltrados = (sifs || []).filter((sif) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(sif.nome || "").includes(normalizar(busca)) ||
      normalizar(sif.codigo || "").includes(normalizar(busca))
    );
  });

  // Estatísticas
  const totalSifs = sifsFiltrados.length;

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="bg-gradient-to-r from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Título e descrição */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                S.I.F (Serviço de Inspeção Federal)
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Gerencie códigos de inspeção sanitária federal para produtos
              </p>
            </div>
            {/* Estatísticas */}
            <div className="flex flex-wrap gap-3">
              <Badge className="px-3 py-1.5 bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                {totalSifs} {totalSifs === 1 ? 'S.I.F' : 'S.I.F.s'}
              </Badge>
            </div>
          </div>

          {/* Botão de adicionar */}
          <Link href={`${pathname}/add`}>
            <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Novo S.I.F
            </Button>
          </Link>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Buscar S.I.F por nome ou código..."
          className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de SIFs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sifsFiltrados.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-6">
                  <Shield className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Nenhum S.I.F encontrado
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
                  {busca ? 
                    `Nenhum S.I.F corresponde à busca "${busca}"` : 
                    "Comece cadastrando códigos de inspeção sanitária federal"
                  }
                </p>
                {!busca && (
                  <Link href={`${pathname}/add`}>
                    <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro S.I.F
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          sifsFiltrados.map((sif) => {
            return (
              <Link href={pathname + `/${sif.id}`} key={sif.id}>
                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700">
                  {/* Gradiente decorativo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="relative pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                          {sif.nome}
                        </CardTitle>
                        {sif.id && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {sif.id.slice(0, 8)}
                          </p>
                        )}
                      </div>
                      <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                        <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-4">
                    {/* Código SIF */}
                    {sif.codigo && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                        <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <div className="flex-1">
                          <p className="text-xs text-teal-600 dark:text-teal-400">Código</p>
                          <p className="font-semibold text-sm text-teal-700 dark:text-teal-300 font-mono">
                            {sif.codigo}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status de validação */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <div className="flex-1">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Status</p>
                        <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-300">
                          Cadastrado e Ativo
                        </p>
                      </div>
                    </div>

                    {/* Informações adicionais */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Identificação</p>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            S.I.F {sif.codigo ? `nº ${sif.codigo}` : sif.nome}
                          </p>
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