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

type Operador = Tables<`operadores`>;

type Operadores = {
  operadores: Operador[] | null;
};

export function OperadoresClient({
  operadores,
}: PropsWithChildren<Operadores>) {
  const [operador, setOperador] = useState<Operador | null>(null);
  const [busca, setBusca] = useState("");

  const operadoresFiltrados = (operadores || []).filter((operador) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(operador.nome!).includes(normalizar(busca)) ||
      normalizar(operador.nome!).includes(normalizar(busca))
    );
  });

  useScrollBehavior(!!operador?.id);

  const bottomSheetControllerUpdateOperador =
    useRef<BottomSheetImperativeHandle>(undefined);
  const bottomSheetControllerCreateOperador =
    useRef<BottomSheetImperativeHandle>(undefined);

  const onSelectOperador = (operador: Operador) => {
    bottomSheetControllerUpdateOperador.current?.onOpen();
    setOperador(operador);
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetControllerUpdateOperador}
        title="Atualizar"
        description=""
      >
        <Forms.Operadores.Update
          operador={operador!}
          bottomSheetController={bottomSheetControllerUpdateOperador}
        />
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetControllerCreateOperador}
        title="Adicionar"
        description=""
      >
        <Forms.Operadores.Create
          bottomSheetController={bottomSheetControllerCreateOperador}
        />
      </BottomSheet>

      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar operadores..."
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
          onClick={() => bottomSheetControllerCreateOperador.current?.onOpen()}
        >
          <Plus />
          Novo
        </Button>
      </div>
      <GridItems>
        {(operadoresFiltrados || [])?.map((operador) => {
          return (
            <GridItem
              title={operador.nome!}
              key={operador.id}
              onClick={() => onSelectOperador(operador)}
            >
              <p className="text-gray-600 mb-2">{operador.cor_fonte}</p>
            </GridItem>
          );
        })}
      </GridItems>
    </>
  );
}
