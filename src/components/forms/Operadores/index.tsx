import { BottomSheetSheetController } from "@/components/bottom-sheet";
import { FormBuilder2 } from "@/components/form-builder";
import { Button } from "@/components/ui/button";
import { useDeviceType } from "@/hooks/use-device-type";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { cn } from "@/lib/utils";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { FormContent } from "..";

const formBuilder = {
  columns: [
    {
      rows: [
        {
          fields: [
            {
              name: "nome",
              label: "Nome",
              placeholder: "Digite o nome Operador",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "cor_botao",
              label: "Cor do Botao",
              placeholder: "Digite a Cor do Botão",
              type: "color",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "cor_fonte",
              label: "Cor da Fonte",
              placeholder: "Digite a Cor da Fonte",
              type: "color",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

type Operador = Tables<"operadores">;

type OperadorProps = {
  operador: Operador;
  bottomSheetController?: BottomSheetSheetController;
};

function Update({
  operador,
  bottomSheetController,
}: Pick<OperadorProps, "operador" | "bottomSheetController">) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ id, ...data }: Operador) => {
    const query = supabase
      .from("operadores")
      .update({ ...data })
      .eq("id", operador.id);

    const { success, message } = await executeQuery<typeof query>(() => query);

    if (success) {
      toast.success(message);
      executeRevalidationPath("/admin/operadores");
    } else if (!success) {
      toast.error(message);
    }
  };

  return (
    <FormContent>
      <FormBuilder2
        builder={formBuilder}
        onSubmit={onSubmit}
        submitLabel="Atualizar"
        buttonsContainerClass={cn({
          "mb-8": useDeviceType() === "PC",
        })}
        form={{ defaultValues: { ...(operador || {}) } }}
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

function Create({
  bottomSheetController,
}: Pick<OperadorProps, "bottomSheetController">) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ ...data }: Operador) => {
    const query = supabase.from("operadores").insert({ ...data });

    const { success, message } = await executeQuery<typeof query>(() => query);

    if (success) {
      toast.success(message);
      bottomSheetController?.current?.onClose();
      executeRevalidationPath("/admin/operadores");
    } else if (!success) {
      toast.error(message);
    }
  };

  return (
    <FormContent>
      <FormBuilder2
        builder={formBuilder}
        onSubmit={onSubmit}
        submitLabel="Adicionar"
        buttonsContainerClass={cn({
          "mb-8": useDeviceType() === "PC",
        })}
        form={{}}
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

export const Operadores = {
  Update,
  Create,
};
