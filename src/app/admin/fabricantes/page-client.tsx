"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import { normalizeCnpj } from "@/components/form-builder/@masks/cnpj";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { ButtonAdd } from "../button-new";

type Operador = Tables<`fabricantes`>;

type Fabricantes = {
  fabricantes: Operador[] | null;
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
      normalizar(fabricante.nome!).includes(normalizar(busca)) ||
      normalizar(fabricante.nome!).includes(normalizar(busca))
    );
  });

  return (
    <>
      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar fabricantes..."
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
        {(fabricantesFiltrados || [])?.map((fabricante) => {
          return (
            <Link href={pathname + `/${fabricante.id}`} key={fabricante.id}>
              <GridItem title={fabricante.nome!}>
                <p className="text-gray-600 mb-2">
                  {normalizeCnpj(fabricante.cnpj!)}
                </p>
              </GridItem>
            </Link>
          );
        })}
      </GridItems>
    </>
  );
}
