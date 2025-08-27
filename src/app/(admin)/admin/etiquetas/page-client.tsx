"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/types/database.types";
import { Search, Package, Calendar, Hash, Layers } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { ButtonAdd } from "../button-new";

type Etiqueta = Tables<`etiquetas`>;

type EtiquetasPage = {
  etiquetas: Etiqueta[] | null;
};

export function EtiquetasPageClient({
  etiquetas,
}: PropsWithChildren<EtiquetasPage>) {
  const pathname = usePathname();

  const [busca, setBusca] = useState("");

  const etiquetasFiltrados = (etiquetas || []).filter((etiqueta) => {
    if (!busca) return true;
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(etiqueta.produto_nome || "").includes(normalizar(busca)) ||
      normalizar(etiqueta.codigo_produto || "").includes(normalizar(busca)) ||
      normalizar(etiqueta.lote || "").includes(normalizar(busca)) ||
      normalizar(etiqueta.SIF || "").includes(normalizar(busca))
    );
  });

  return (
    <>
      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar etiquetas..."
          className="pl-10"
          onChange={(event) => setBusca(event.target.value)}
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      <ButtonAdd />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {etiquetasFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="flex flex-col items-center justify-center">
              <Package className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhuma etiqueta encontrada</p>
              <p className="text-gray-400 text-sm mt-2">Crie uma nova etiqueta usando o botão acima</p>
            </div>
          </div>
        ) : (
          etiquetasFiltrados.map((etiqueta) => {
            const titulo = etiqueta.produto_nome || etiqueta.codigo_produto || "Etiqueta sem nome";
            return (
              <Link href={pathname + `/${etiqueta.id}`} key={etiqueta.id}>
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {titulo}
                      </CardTitle>
                      {etiqueta.status && (
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          etiqueta.status === 'completed' ? 'bg-green-100 text-green-800' :
                          etiqueta.status === 'error' ? 'bg-red-100 text-red-800' :
                          etiqueta.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {etiqueta.status}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {etiqueta.codigo_produto && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Hash className="h-4 w-4" />
                        <span>{etiqueta.codigo_produto}</span>
                      </div>
                    )}
                    {etiqueta.lote && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Layers className="h-4 w-4" />
                        <span>Lote: {etiqueta.lote}</span>
                      </div>
                    )}
                    {etiqueta.quantidade && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>Quantidade: {etiqueta.quantidade}</span>
                      </div>
                    )}
                    {etiqueta.validade && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(etiqueta.validade).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
