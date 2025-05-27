"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { ButtonAdd } from "../button-new";

type Grupo = Tables<`grupos`>;

type GruposPage = {
  grupos: Grupo[] | null;
};

export function GruposPageClient({ grupos }: PropsWithChildren<GruposPage>) {
  const pathname = usePathname();
  const [busca, setBusca] = useState("");

  const gruposFiltrados = (grupos || []).filter((grupo) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(grupo.nome!).includes(normalizar(busca)) ||
      normalizar(grupo.nome!).includes(normalizar(busca))
    );
  });

  return (
    <>
      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar grupos..."
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
        {(gruposFiltrados || [])?.map((grupo) => {
          return (
            <Link href={pathname + `/${grupo.id}`} key={grupo.id}>
              <GridItem title={grupo.nome!} key={grupo.id}>
                <p className="text-gray-600 mb-2">{grupo.cor_botao}</p>
                <p className="font-bold">{grupo.cor_fonte}</p>
              </GridItem>
            </Link>
          );
        })}
      </GridItems>
    </>
  );
}
