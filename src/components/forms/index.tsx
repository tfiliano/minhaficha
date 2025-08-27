"use client";
import { PropsWithChildren } from "react";
import { Fabricantes } from "./Fabricantes";
import { Grupos } from "./Grupos";
import { LocalArmazenamento } from "./LocalArmazenamento";
import { Operadores } from "./Operadores";
import { Produto } from "./produtos";

import { FormBuilder2 } from "@/components/form-builder";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/hooks/use-router";
import { PublicSchema } from "@/types/database.types";
import { Etiquetas } from "./Etiquetas";
import { Impressora } from "./Impressoras";
import { Loja } from "./Loja";
import { ButtonRemoveItem } from "./remove-item-table";
import { Setores } from "./Setores";
import { SIF } from "./SIF";
import { Usuarios } from "./Usuario";

export const Forms = {
  Produto,
  LocalArmazenamento,
  Grupos,
  Operadores,
  Fabricantes,
  Etiquetas,
  Impressora,
  SIF,
  Loja,
  Usuarios,
  Setores,
};

export function FormContent({ children }: PropsWithChildren) {
  return <div className="max-w-lg w-full mx-auto px-4">{children}</div>;
}

type ModeFormHandler = "create" | "update";

export type TableCollection = keyof (PublicSchema["Tables"] &
  PublicSchema["Views"]);

export type ModeFormHandlerProp = { mode: ModeFormHandler; keyProp?: string };

type EntityFormHandlerProps<T> = {
  mode: ModeFormHandler;
  entity?: T;
  builder: any;
  onSubmit: (data: T) => Promise<void>;
  submitLabel: string;
  tableCollection?: TableCollection;
  keyProp?: string;
  formRef?: any;
};

export function EntityFormHandler<T>({
  mode,
  entity,
  builder,
  onSubmit,
  submitLabel,
  tableCollection,
  keyProp,
  formRef,
}: EntityFormHandlerProps<T>) {
  const router = useRouter();

  return (
    <FormContent>
      <FormBuilder2
        ref={formRef}
        builder={builder}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        form={{ defaultValues: entity }}
        extraButtons={
          <Button
            variant="outline"
            className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-300"
            type="button"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        }
      />
      {mode === "update" && tableCollection && (
        <ButtonRemoveItem<T>
          entity={entity}
          tableCollection={tableCollection}
          keyProp={keyProp}
        />
      )}
    </FormContent>
  );
}
