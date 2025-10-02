"use client";

import { normalizeCnpj } from "@/components/form-builder/@masks/cnpj";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/database.types";
import { 
  Search, 
  Building2, 
  Plus, 
  Hash,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { cn } from "@/lib/utils";

type Fabricante = Tables<`fabricantes`>;

type Fabricantes = {
  fabricantes: Fabricante[] | null;
};

export function FabricantesClient({
  fabricantes,
}: PropsWithChildren<Fabricantes>) {
  const pathname = usePathname();
  const [busca, setBusca] = useState("");

  const fabricantesFiltrados = (fabricantes || []).filter((fabricante) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(fabricante.nome || "").includes(normalizar(busca)) ||
      normalizar(fabricante.cnpj || "").includes(normalizar(busca))
    );
  });

  // Estatísticas
  const totalFabricantes = fabricantesFiltrados.length;

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Título e descrição */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Fabricantes
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Gerencie fornecedores e fabricantes de produtos
              </p>
            </div>
            {/* Estatísticas */}
            <div className="flex flex-wrap gap-3">
              <Badge className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                <Building2 className="h-3.5 w-3.5 mr-1.5" />
                {totalFabricantes} {totalFabricantes === 1 ? 'fabricante' : 'fabricantes'}
              </Badge>
            </div>
          </div>

          {/* Botão de adicionar */}
          <Link href={`${pathname}/add`}>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Novo Fabricante
            </Button>
          </Link>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Buscar fabricantes por nome ou CNPJ..."
          className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de fabricantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {fabricantesFiltrados.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-6">
                  <Building2 className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Nenhum fabricante encontrado
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
                  {busca ? 
                    `Nenhum fabricante corresponde à busca "${busca}"` : 
                    "Comece cadastrando seu primeiro fabricante ou fornecedor"
                  }
                </p>
                {!busca && (
                  <Link href={`${pathname}/add`}>
                    <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Fabricante
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          fabricantesFiltrados.map((fabricante) => {
            return (
              <Link href={pathname + `/${fabricante.id}`} key={fabricante.id}>
                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 h-full">
                  {/* Gradiente decorativo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="relative pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {fabricante.nome}
                        </CardTitle>
                        {fabricante.id && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {fabricante.id.slice(0, 8)}
                          </p>
                        )}
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-4">
                    {/* CNPJ */}
                    {fabricante.cnpj && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Hash className="h-4 w-4 text-slate-500" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">CNPJ</p>
                          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 font-mono">
                            {normalizeCnpj(fabricante.cnpj)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Informações adicionais */}
                    <div className="space-y-3">
                      {fabricante.endereco && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Endereço</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                              {fabricante.endereco}
                            </p>
                          </div>
                        </div>
                      )}

                      {fabricante.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Telefone</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {fabricante.telefone}
                            </p>
                          </div>
                        </div>
                      )}

                      {fabricante.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                              {fabricante.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Se não tem info adicional, mostra espaço reservado */}
                    {!fabricante.endereco && !fabricante.telefone && !fabricante.email && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-400 italic">
                          Clique para adicionar mais informações
                        </p>
                      </div>
                    )}
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