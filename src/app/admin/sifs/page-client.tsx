"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { ButtonAdd } from "../button-new";

type Sif = Tables<`sifs`>;

type SifsPage = {
  sifs: Sif[] | null;
};

export function SifsPageClient({ sifs }: PropsWithChildren<SifsPage>) {
  const pathname = usePathname();
  const [busca, setBusca] = useState("");

  const sifsFiltrados = (sifs || []).filter((sif) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(sif.nome!).includes(normalizar(busca)) ||
      normalizar(sif.nome!).includes(normalizar(busca))
    );
  });

  return (
    <>
      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar Sifs..."
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
        {(sifsFiltrados || [])?.map((sif) => {
          return (
            <Link href={pathname + `/${sif.id}`} key={sif.id}>
              <GridItem title={sif.nome!}></GridItem>
            </Link>
          );
        })}
      </GridItems>
    </>
  );
}
