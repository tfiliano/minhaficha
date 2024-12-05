"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { ButtonAdd } from "../button-new";

type Produto = Tables<`produtos`>;
type Grupo = Tables<`grupos`>;
type LocalArmazenamento = Tables<"locais_armazenamento">;

type ProdutosPage = {
  produtos: Produto[] | null;
};

export function ProdutosPageClient({
  produtos,
}: PropsWithChildren<ProdutosPage>) {
  const pathname = usePathname();
  const [busca, setBusca] = useState("");

  const produtosFiltrados = (produtos || []).filter((produto) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(produto.nome).includes(normalizar(busca)) ||
      normalizar(produto.nome).includes(normalizar(busca))
    );
  });

  return (
    <>
      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar produtos..."
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
        {(produtosFiltrados || [])?.map((produto) => {
          return (
            <Link href={pathname + `/${produto.id}`} key={produto.id}>
              <GridItem title={produto.nome}>
                <p className="text-gray-600 mb-2">{produto.codigo}</p>
                <p className="font-bold">{produto.unidade}</p>
              </GridItem>
            </Link>
          );
        })}
      </GridItems>
    </>
  );
}
