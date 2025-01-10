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
import { Codigo } from "./Codigos";
import { Etiquetas } from "./Etiquetas";
import { Impressora } from "./Impressoras";
import { ButtonRemoveItem } from "./remove-item-table";
import { SIF } from "./SIF";

export const Forms = {
  Produto,
  LocalArmazenamento,
  Grupos,
  Operadores,
  Fabricantes,
  Etiquetas,
  Impressora,
  SIF,
  Codigo,
};

export function FormContent({ children }: PropsWithChildren) {
  return <div className="max-w-lg w-full mx-auto px-4">{children}</div>;
}

type ModeFormHandler = "create" | "update";

export type TableCollection = keyof (PublicSchema["Tables"] &
  PublicSchema["Views"]);

export type ModeFormHandlerProp = { mode: ModeFormHandler };

type EntityFormHandlerProps<T> = {
  mode: ModeFormHandler;
  entity?: T;
  builder: any;
  onSubmit: (data: T) => Promise<void>;
  submitLabel: string;
  tableCollection?: TableCollection;
};

export function EntityFormHandler<T>({
  mode,
  entity,
  builder,
  onSubmit,
  submitLabel,
  tableCollection,
}: EntityFormHandlerProps<T>) {
  const router = useRouter();

  return (
    <FormContent>
      <FormBuilder2
        builder={builder}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        form={{ defaultValues: entity }}
        extraButtons={
          <Button
            variant="destructive"
            className="w-full"
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
        />
      )}
    </FormContent>
  );
}
