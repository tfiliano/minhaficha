"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { ButtonAdd } from "../button-new";

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
      normalizar(setor.nome!).includes(normalizar(busca)) ||
      normalizar(setor.nome!).includes(normalizar(busca))
    );
  });

  return (
    <>
      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar setores..."
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
        {(setoresFiltrados || [])?.map((setor) => {
          return (
            <Link href={pathname + `/${setor.id}`} key={setor.id}>
              <GridItem title={setor.nome!} key={setor.id}>
                <p className="text-gray-600 mb-2">{setor.cor_botao}</p>
                <p className="font-bold">{setor.cor_fonte}</p>
              </GridItem>
            </Link>
          );
        })}
      </GridItems>
    </>
  );
}
