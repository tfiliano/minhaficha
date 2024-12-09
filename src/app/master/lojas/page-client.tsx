"use client";

import { ButtonAdd } from "@/app/admin/button-new";
import { GridItem, GridItems } from "@/components/admin/grid-items";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";

type Loja = Tables<`lojas`>;

type Lojas = {
  lojas: Loja[] | null;
};

export function LojasClient({ lojas }: PropsWithChildren<Lojas>) {
  const pathname = usePathname();
  const [busca, setBusca] = useState("");

  const lojasFiltrados = (lojas || []).filter((loja) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(loja.nome!).includes(normalizar(busca)) ||
      normalizar(loja.nome!).includes(normalizar(busca))
    );
  });

  return (
    <>
      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar loja..."
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
        {(lojasFiltrados || [])?.map((loja) => {
          return (
            <Link href={pathname + `/${loja.id}`} key={loja.id}>
              <GridItem title={loja.nome!}>
                <p className="text-gray-600 mb-2">{loja.codigo!}</p>
              </GridItem>
            </Link>
          );
        })}
      </GridItems>
    </>
  );
}
