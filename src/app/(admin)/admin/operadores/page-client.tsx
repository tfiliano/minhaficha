"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { ButtonAdd } from "../button-new";

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
      normalizar(operador.nome!).includes(normalizar(busca)) ||
      normalizar(operador.nome!).includes(normalizar(busca))
    );
  });

  return (
    <>
      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar operadores..."
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
        {(operadoresFiltrados || [])?.map((operador) => {
          return (
            <Link href={pathname + `/${operador.id}`} key={operador.id}>
              <GridItem title={operador.nome!}>
                <p className="text-gray-600 mb-2">{operador.cor_fonte}</p>
              </GridItem>
            </Link>
          );
        })}
      </GridItems>
    </>
  );
}
