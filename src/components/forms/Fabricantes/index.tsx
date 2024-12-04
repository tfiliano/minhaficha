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
              placeholder: "Digite o nome Fabricante",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "cnpj",
              label: "CNPJ",
              placeholder: "Digite o CNPJ",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

type Fabricante = Tables<"fabricantes">;

type FabricanteProps = {
  fabricante: Fabricante;
  bottomSheetController?: BottomSheetSheetController;
};

function Update({
  fabricante,
  bottomSheetController,
}: Pick<FabricanteProps, "fabricante" | "bottomSheetController">) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ id, ...data }: Fabricante) => {
    const query = supabase
      .from("fabricantes")
      .update({ ...data })
      .eq("id", fabricante.id);

    const { success, message } = await executeQuery<typeof query>(() => query);

    if (success) {
      toast.success(message);
      executeRevalidationPath("/admin/fabricantes");
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
        form={{ defaultValues: { ...(fabricante || {}) } }}
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
}: Pick<FabricanteProps, "bottomSheetController">) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ ...data }: Fabricante) => {
    const query = supabase.from("fabricantes").insert({ ...data });

    const { success, message } = await executeQuery<typeof query>(() => query);

    if (success) {
      toast.success(message);
      bottomSheetController?.current?.onClose();
      executeRevalidationPath("/admin/fabricantes");
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

export const Fabricantes = {
  Update,
  Create,
};
