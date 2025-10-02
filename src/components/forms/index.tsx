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
import { Check, X } from "lucide-react";

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-4 sm:py-6">
      <div className="w-full px-3 sm:px-4 max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
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
            className="h-9 px-4 sm:flex-1 text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 gap-2 w-full sm:w-auto"
            type="button"
            onClick={() => router.back()}
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        }
        removeButton={
          mode === "update" && tableCollection ? (
            <ButtonRemoveItem<T>
              entity={entity}
              tableCollection={tableCollection}
              keyProp={keyProp}
            />
          ) : undefined
        }
      />
    </FormContent>
  );
}
