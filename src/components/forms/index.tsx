import { PropsWithChildren } from "react";
import { Fabricantes } from "./Fabricantes";
import { Grupos } from "./Grupos";
import { LocalArmazenamento } from "./LocalArmazenamento";
import { Operadores } from "./Operadores";
import { Produto } from "./produtos";

import { BottomSheetSheetController } from "@/components/bottom-sheet";
import { FormBuilder2 } from "@/components/form-builder";
import { Button } from "@/components/ui/button";
import { useDeviceType } from "@/hooks/use-device-type";
import { cn } from "@/lib/utils";

export const Forms = {
  Produto,
  LocalArmazenamento,
  Grupos,
  Operadores,
  Fabricantes,
};

export function FormContent({ children }: PropsWithChildren) {
  return <div className="max-w-lg w-full mx-auto px-4">{children}</div>;
}

type ModeFormHandler = "create" | "update";
export type ModeFormHandlerProp = { mode: ModeFormHandler };

type EntityFormHandlerProps<T> = {
  mode: ModeFormHandler;
  entity?: T;
  builder: any;
  onSubmit: (data: T) => Promise<void>;
  submitLabel: string;
  bottomSheetController?: BottomSheetSheetController;
};

export function EntityFormHandler<T>({
  mode,
  entity,
  builder,
  onSubmit,
  submitLabel,
  bottomSheetController,
}: EntityFormHandlerProps<T>) {
  return (
    <FormContent>
      <FormBuilder2
        builder={builder}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        buttonsContainerClass={cn({
          "mb-8": useDeviceType() === "PC",
        })}
        form={{ defaultValues: entity }}
        extraButtons={
          <Button
            variant="destructive"
            className="w-full"
            type="button"
            onClick={() => bottomSheetController?.current?.onClose()}
          >
            Cancelar
          </Button>
        }
      />
    </FormContent>
  );
}
