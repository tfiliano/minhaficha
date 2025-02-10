"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
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
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(etiqueta.SIF!).includes(normalizar(busca)) ||
      normalizar(etiqueta.SIF!).includes(normalizar(busca))
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
      <GridItems>
        {(etiquetasFiltrados || [])?.map((etiqueta) => {
          return (
            <Link href={pathname + `/${etiqueta.id}`} key={etiqueta.id}>
              <GridItem title={etiqueta.SIF!}>
                <p className="text-gray-600 mb-2">{etiqueta.SIF}</p>
              </GridItem>
            </Link>
          );
        })}
      </GridItems>
    </>
  );
}
