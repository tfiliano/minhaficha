"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { ButtonAdd } from "../button-new";

type Sif = Tables<`codigos`>;

type CodigosPage = {
  codigos: Sif[] | null;
};

export function CodigosPageClient({ codigos }: PropsWithChildren<CodigosPage>) {
  const pathname = usePathname();
  const [busca, setBusca] = useState("");

  const codigosFiltrados = (codigos || []).filter((codigo) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(codigo.code!).includes(normalizar(busca)) ||
      normalizar(codigo.code!).includes(normalizar(busca))
    );
  });

  return (
    <>
      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar Codigos..."
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
        {(codigosFiltrados || [])?.map((codigos) => {
          return (
            <Link href={pathname + `/${codigos.id}`} key={codigos.id}>
              <GridItem title={codigos.code!}></GridItem>
            </Link>
          );
        })}
      </GridItems>
    </>
  );
}
