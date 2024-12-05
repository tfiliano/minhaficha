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

type Grupo = Tables<`grupos`>;

type GruposPage = {
  grupos: Grupo[] | null;
};

export function GruposPageClient({ grupos }: PropsWithChildren<GruposPage>) {
  const [grupo, setGrupo] = useState<Grupo | null>(null);
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

  useScrollBehavior(!!grupo?.id);

  const bottomSheetControllerUpdateGrupo =
    useRef<BottomSheetImperativeHandle>(undefined);
  const bottomSheetControllerCreateGrupo =
    useRef<BottomSheetImperativeHandle>(undefined);

  const onSelectGrupo = (grupo: Grupo) => {
    bottomSheetControllerUpdateGrupo.current?.onOpen();
    setGrupo(grupo);
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetControllerUpdateGrupo}
        title="Atualizar"
        description=""
      >
        <Forms.Grupos.Update
          grupo={grupo!}
          bottomSheetController={bottomSheetControllerUpdateGrupo}
        />
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetControllerCreateGrupo}
        title="Adicionar"
        description=""
      >
        <Forms.Grupos.Create
          bottomSheetController={bottomSheetControllerCreateGrupo}
        />
      </BottomSheet>

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
      <div className="flex items-center justify-end mb-4 w-full">
        <Button
          className="w-full sm:w-fit"
          onClick={() => bottomSheetControllerCreateGrupo.current?.onOpen()}
        >
          <Plus />
          Novo
        </Button>
      </div>
      <GridItems>
        {(gruposFiltrados || [])?.map((grupo) => {
          return (
            <GridItem
              title={grupo.nome!}
              key={grupo.id}
              onClick={() => onSelectGrupo(grupo)}
            >
              <p className="text-gray-600 mb-2">{grupo.cor_botao}</p>
              <p className="font-bold">{grupo.cor_fonte}</p>
            </GridItem>
          );
        })}
      </GridItems>
    </>
  );
}
