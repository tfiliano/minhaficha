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
              name: "armazenamento",
              label: "Local Armazanamento",
              placeholder: "Digite o código do Local Armazanamento",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "metodo",
              label: "Metodo",
              placeholder: "Digite o metodo",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

type LocalArmazenamento = Tables<"locais_armazenamento">;

type LocalArmazenamentoProps = {
  localArmazenamento: LocalArmazenamento;
  bottomSheetController?: BottomSheetSheetController;
};

function Update({
  localArmazenamento,
  bottomSheetController,
}: Pick<
  LocalArmazenamentoProps,
  "localArmazenamento" | "bottomSheetController"
>) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ id, ...data }: LocalArmazenamento) => {
    const query = supabase
      .from("locais_armazenamento")
      .update({ ...data })
      .eq("id", localArmazenamento.id);

    const { success, message } = await executeQuery<typeof query>(() => query);

    if (success) {
      toast.success(message);
      executeRevalidationPath("/admin/armazenamentos");
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
        form={{ defaultValues: { ...(localArmazenamento || {}) } }}
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
}: Pick<LocalArmazenamentoProps, "bottomSheetController">) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ ...data }: LocalArmazenamento) => {
    const query = supabase.from("locais_armazenamento").insert({ ...data });

    const { success, message } = await executeQuery<typeof query>(() => query);

    if (success) {
      toast.success(message);
      bottomSheetController?.current?.onClose();
      executeRevalidationPath("/admin/armazenamentos");
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

export const LocalArmazenamento = {
  Update,
  Create,
};
