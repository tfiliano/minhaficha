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

type LocalArmazanamento = Tables<`locais_armazenamento`>;

type LocaisArmazenamento = {
  locais_armazenamento: LocalArmazanamento[] | null;
};

export function LocaisArmazenamentoClient({
  locais_armazenamento,
}: PropsWithChildren<LocaisArmazenamento>) {
  const [localArmazenamento, setLocalArmazenamento] =
    useState<LocalArmazanamento | null>(null);
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

  useScrollBehavior(!!localArmazenamento?.id);

  const bottomSheetControllerUpdateLocalArmazanamento =
    useRef<BottomSheetImperativeHandle>(undefined);
  const bottomSheetControllerCreateLocalArmazanamento =
    useRef<BottomSheetImperativeHandle>(undefined);

  const onSelectLocalArmazanamento = (
    localArmazenamento: LocalArmazanamento
  ) => {
    bottomSheetControllerUpdateLocalArmazanamento.current?.onOpen();
    setLocalArmazenamento(localArmazenamento);
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetControllerUpdateLocalArmazanamento}
        title="Atualizar"
        description=""
      >
        <Forms.LocalArmazenamento.Update
          localArmazenamento={localArmazenamento!}
          bottomSheetController={bottomSheetControllerUpdateLocalArmazanamento}
        />
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetControllerCreateLocalArmazanamento}
        title="Adicionar"
        description=""
      >
        <Forms.LocalArmazenamento.Create
          bottomSheetController={bottomSheetControllerCreateLocalArmazanamento}
        />
      </BottomSheet>

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
      <div className="flex items-center justify-end mb-4 w-full">
        <Button
          className="w-full sm:w-fit"
          onClick={() =>
            bottomSheetControllerCreateLocalArmazanamento.current?.onOpen()
          }
        >
          <Plus />
          Novo
        </Button>
      </div>
      <GridItems>
        {(locais_armazenamentoFiltrados || [])?.map((local) => {
          return (
            <GridItem
              title={local.armazenamento!}
              key={local.id}
              onClick={() => onSelectLocalArmazanamento(local)}
            >
              <p className="text-gray-600 mb-2">{local.metodo}</p>
            </GridItem>
          );
        })}
      </GridItems>
    </>
  );
}
