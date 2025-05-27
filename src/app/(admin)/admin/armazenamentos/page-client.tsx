"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { ButtonAdd } from "../button-new";

type LocalArmazanamento = Tables<`locais_armazenamento`>;

type LocaisArmazenamento = {
  locais_armazenamento: LocalArmazanamento[] | null;
};

export function LocaisArmazenamentoClient({
  locais_armazenamento,
}: PropsWithChildren<LocaisArmazenamento>) {
  const pathname = usePathname();

  const [busca, setBusca] = useState("");

  const locais_armazenamentoFiltrados = (locais_armazenamento || []).filter(
    (local) => {
      const normalizar = (texto: string) =>
        texto
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
      return (
        normalizar(local.armazenamento!).includes(normalizar(busca)) ||
        normalizar(local.armazenamento!).includes(normalizar(busca))
      );
    }
  );

  return (
    <>
      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar locais armazenamento..."
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
        {(locais_armazenamentoFiltrados || [])?.map((local) => {
          return (
            <Link href={pathname + `/${local.id}`} key={local.id}>
              <GridItem title={local.armazenamento!}>
                <p className="text-gray-600 mb-2">{local.metodo}</p>
              </GridItem>
            </Link>
          );
        })}
      </GridItems>
    </>
  );
}
