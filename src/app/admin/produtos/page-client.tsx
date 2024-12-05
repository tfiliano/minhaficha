"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import {
  BottomSheet,
  BottomSheetImperativeHandle,
} from "@/components/bottom-sheet";
import { Forms } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScrollBehavior } from "@/hooks/use-scroll-behavior";
import { Tables } from "@/types/database.types";
import { Plus, Search } from "lucide-react";
import { PropsWithChildren, useRef, useState } from "react";

type Produto = Tables<`produtos`>;
type Grupo = Tables<`grupos`>;
type LocalArmazenamento = Tables<"locais_armazenamento">;

type ProdutosPage = {
  produtos: Produto[] | null;
  grupos: Grupo[] | null;
  armazenamentos: LocalArmazenamento[] | null;
};

export function ProdutosPageClient({
  produtos,
  grupos,
  armazenamentos,
}: PropsWithChildren<ProdutosPage>) {
  const [produto, setProduto] = useState<Produto | null>(null);
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

  useScrollBehavior(!!produto?.id);

  const bottomSheetControllerUpdateProduto =
    useRef<BottomSheetImperativeHandle>(undefined);
  const bottomSheetControllerCreateProduto =
    useRef<BottomSheetImperativeHandle>(undefined);

  const onSelectProduto = (produto: Produto) => {
    bottomSheetControllerUpdateProduto.current?.onOpen();
    setProduto(produto);
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetControllerUpdateProduto}
        title="Atualizar"
        description=""
      >
        <Forms.Produto.Update
          produto={produto!}
          grupos={grupos!}
          armazenamentos={armazenamentos!}
          produtos={produtos!}
          bottomSheetController={bottomSheetControllerUpdateProduto}
        />
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetControllerCreateProduto}
        title="Adicionar"
        description=""
      >
        <Forms.Produto.Create
          grupos={grupos!}
          armazenamentos={armazenamentos!}
          produtos={produtos!}
          bottomSheetController={bottomSheetControllerCreateProduto}
        />
      </BottomSheet>

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
      <div className="flex items-center justify-end mb-4 w-full">
        <Button
          className="w-full sm:w-fit"
          onClick={() => bottomSheetControllerCreateProduto.current?.onOpen()}
        >
          <Plus />
          Novo
        </Button>
      </div>
      <GridItems>
        {(produtosFiltrados || [])?.map((produto) => {
          return (
            <GridItem
              title={produto.nome}
              key={produto.id}
              onClick={() => onSelectProduto(produto)}
            >
              <p className="text-gray-600 mb-2">{produto.codigo}</p>
              <p className="font-bold">{produto.unidade}</p>
            </GridItem>
          );
        })}
      </GridItems>
    </>
  );
}
