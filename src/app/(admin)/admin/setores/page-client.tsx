"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/database.types";
import { 
  Search, 
  Users, 
  Plus, 
  Palette,
  Hash,
  Building
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { cn } from "@/lib/utils";

type Setor = Tables<`setores`>;

type SetoresPage = {
  setores: Setor[] | null;
};

export function SetoresPageClient({ setores }: PropsWithChildren<SetoresPage>) {
  const pathname = usePathname();
  const [busca, setBusca] = useState("");

  const setoresFiltrados = (setores || []).filter((setor) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(setor.nome || "").includes(normalizar(busca))
    );
  });

  // Estatísticas
  const totalSetores = setoresFiltrados.length;

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Título e descrição */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Setores
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Organize funcionários e operações por setores da empresa
              </p>
            </div>
            {/* Estatísticas */}
            <div className="flex flex-wrap gap-3">
              <Badge className="px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                {totalSetores} {totalSetores === 1 ? 'setor' : 'setores'}
              </Badge>
            </div>
          </div>

          {/* Botão de adicionar */}
          <Link href={`${pathname}/add`}>
            <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Novo Setor
            </Button>
          </Link>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Buscar setores por nome..."
          className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de setores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {setoresFiltrados.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-6">
                  <Users className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Nenhum setor encontrado
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
                  {busca ? 
                    `Nenhum setor corresponde à busca "${busca}"` : 
                    "Comece criando setores para organizar sua empresa"
                  }
                </p>
                {!busca && (
                  <Link href={`${pathname}/add`}>
                    <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Setor
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          setoresFiltrados.map((setor) => {
            const corBotao = setor.cor_botao || '#6366F1';
            const corFonte = setor.cor_fonte || '#FFFFFF';
            
            return (
              <Link href={pathname + `/${setor.id}`} key={setor.id}>
                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700">
                  {/* Gradiente decorativo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="relative pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {setor.nome}
                        </CardTitle>
                        {setor.id && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {setor.id.slice(0, 8)}
                          </p>
                        )}
                      </div>
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-4">
                    {/* Preview das cores */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Palette className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cor do Botão</p>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                              style={{ backgroundColor: corBotao }}
                            />
                            <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                              {corBotao}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Palette className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cor da Fonte</p>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center"
                              style={{ backgroundColor: corFonte }}
                            >
                              <span className="text-xs font-bold" style={{ color: corBotao }}>A</span>
                            </div>
                            <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                              {corFonte}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview do setor */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Preview</p>
                      <div 
                        className="px-4 py-2 rounded-lg text-center font-semibold text-sm shadow-sm flex items-center justify-center gap-2"
                        style={{ 
                          backgroundColor: corBotao,
                          color: corFonte
                        }}
                      >
                        <Building className="h-4 w-4" />
                        {setor.nome}
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